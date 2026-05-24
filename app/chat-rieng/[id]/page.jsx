'use client'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import ProtectedRoute from '@/components/ProtectedRoute'

export default function ChatRiengDetail() {
  const { user, supabase, isAdmin } = useAuth()
  const params = useParams()
  const urlParamId = params.id

  const [room, setRoom] = useState(null)
  const [request, setRequest] = useState(null)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(true)
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    if (!user) return
    let isMounted = true
    let channel = null

    const initChat = async () => {
      // Tìm phòng chat bằng id (khi vào từ danh sách chat) hoặc bằng request_id (khi vào từ chi tiết yêu cầu)
      const { data: roomData, error: roomError } = await supabase
        .from('chat_rooms')
        .select('*, document_requests(id, title, status, budget, is_paid)')
        .or(`id.eq.${urlParamId},request_id.eq.${urlParamId}`)
        .single()

      if (roomError || !roomData) {
        console.error('Không tìm thấy phòng chat:', roomError)
        if (isMounted) setLoading(false)
        return
      }

      const actualRoomId = roomData.id

      if (isMounted) {
        setRoom(roomData)
        setRequest(roomData.document_requests)
      }

      // Fetch messages
      const { data: msgs } = await supabase
        .from('chat_messages')
        .select('*, profiles(full_name, role)')
        .eq('room_id', actualRoomId)
        .order('created_at', { ascending: true })

      if (msgs && isMounted) {
        setMessages(msgs)
      }
      if (isMounted) setLoading(false)

      if (!isMounted) return

      // Realtime subscription
      channel = supabase
        .channel(`private-chat-${actualRoomId}`)
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `room_id=eq.${actualRoomId}`,
        }, async (payload) => {
          const { data: senderProfile } = await supabase
            .from('profiles')
            .select('full_name, role')
            .eq('id', payload.new.sender_id)
            .single()

          if (isMounted) {
            setMessages(prev => [...prev, { ...payload.new, profiles: senderProfile }])
          }
        })
        .subscribe()
    }

    initChat()

    return () => {
      isMounted = false
      if (channel) {
        supabase.removeChannel(channel)
      }
    }
  }, [user, urlParamId, supabase])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSend = async (e) => {
    e.preventDefault()
    if (!input.trim() || !user || !room) return

    const currentInput = input.trim()
    setInput('') // Clear input immediately for better UX

    const { data: newMsg, error } = await supabase
      .from('chat_messages')
      .insert([{
        room_id: room.id,
        sender_id: user.id,
        content: currentInput,
      }])
      .select('*, profiles(full_name, role)')
      .single()

    if (!error && newMsg) {
      setMessages(prev => {
        // Tránh trùng lặp nếu Realtime đã bắt được tin nhắn này
        if (prev.some(m => m.id === newMsg.id)) return prev
        return [...prev, newMsg]
      })
    } else if (error) {
      console.error('Lỗi gửi tin nhắn:', error.message)
      alert('Không thể gửi tin nhắn. Vui lòng thử lại.')
      setInput(currentInput) // Restore input if failed
    }
  }

  const getStatusLabel = (status) => {
    switch (status) {
      case 'pending': return 'Chờ duyệt'
      case 'discussing': return 'Đang thảo luận'
      case 'processing': return 'Đang xử lý'
      case 'completed': return 'Hoàn thành'
      case 'rejected': return 'Từ chối'
      default: return status || 'N/A'
    }
  }

  return (
    <ProtectedRoute>
    {loading ? (
      <div className="container" style={{ textAlign: 'center', padding: '4rem' }}><p>Đang tải...</p></div>
    ) : !room ? (
      <div className="container" style={{ textAlign: 'center', padding: '4rem' }}>
        <p style={{ color: 'var(--text-muted)' }}>Không tìm thấy phòng chat. Phòng chat có thể đã bị xoá hoặc bạn không có quyền truy cập.</p>
        <Link href="/chat-rieng" className="btn btn-primary" style={{ marginTop: '1rem' }}>Về danh sách Chat</Link>
      </div>
    ) : (
    <div className="container" style={{ height: 'calc(100vh - 100px)', display: 'flex', flexDirection: 'column', paddingTop: '1rem', paddingBottom: '1rem' }}>

      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem', gap: '1rem' }}>
        <Link href="/chat-rieng" className="btn btn-outline" style={{ padding: '0.5rem 1rem' }}>
          &larr; Trở lại
        </Link>
        <h1 style={{ fontSize: '1.5rem', margin: 0 }}>
          {request?.title || room.name || 'Phòng Chat'}
        </h1>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '2rem', flex: 1, overflow: 'hidden' }}>

        {/* Chat Area */}
        <div className="card" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', padding: 0 }}>
          <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border)', background: 'rgba(248, 250, 252, 0.5)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold' }}>
              {isAdmin ? 'U' : 'AD'}
            </div>
            <div>
              <h3 style={{ fontSize: '1.1rem', margin: 0 }}>
                {isAdmin ? 'Người yêu cầu' : 'Admin Hỗ Trợ'}
              </h3>
              <span style={{ fontSize: '0.85rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', display: 'inline-block' }}></span>
                Kết nối Realtime
              </span>
            </div>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {messages.length === 0 ? (
              <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>Chưa có tin nhắn. Hãy bắt đầu cuộc trò chuyện!</p>
            ) : messages.map(msg => {
              const isMe = msg.sender_id === user?.id
              return (
                <div key={msg.id} style={{ display: 'flex', flexDirection: 'column', alignItems: isMe ? 'flex-end' : 'flex-start' }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginBottom: '0.25rem' }}>
                    <span style={{ fontWeight: '600', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      {msg.profiles?.full_name || 'User'}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {new Date(msg.created_at).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div style={{
                    background: isMe ? 'var(--primary)' : 'var(--background)',
                    color: isMe ? 'white' : 'var(--text)',
                    padding: '0.75rem 1rem',
                    borderRadius: '1rem',
                    borderTopRightRadius: isMe ? '0' : '1rem',
                    borderTopLeftRadius: isMe ? '1rem' : '0',
                    border: isMe ? 'none' : '1px solid var(--border)',
                    maxWidth: '85%',
                    lineHeight: '1.5'
                  }}>
                    {msg.content}
                  </div>
                </div>
              )
            })}
            <div ref={messagesEndRef} />
          </div>

          <div style={{ padding: '1rem', borderTop: '1px solid var(--border)', background: 'var(--card-bg)' }}>
            <form onSubmit={handleSend} style={{ display: 'flex', gap: '0.75rem' }}>
              <input
                type="text"
                className="form-input"
                placeholder={isAdmin ? "Nhập tin nhắn cho User..." : "Nhập tin nhắn cho Admin..."}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                style={{ flex: 1, marginBottom: 0 }}
              />
              <button type="submit" className="btn btn-primary" style={{ padding: '0 1.5rem' }}>
                Gửi
              </button>
            </form>
          </div>
        </div>

        {/* Sidebar: Thông tin yêu cầu */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', overflowY: 'auto' }}>

          {request && (
            <div className="card" style={{ padding: '1.5rem' }}>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>Thông tin yêu cầu</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.9rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Trạng thái:</span>
                  <span style={{ fontWeight: '600', color: 'var(--primary)' }}>{getStatusLabel(request.status)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Thanh toán:</span>
                  <span style={{ fontWeight: '600', color: request.is_paid ? '#059669' : '#dc2626' }}>
                    {request.is_paid ? '✓ Đã TT' : '✗ Chưa TT'}
                  </span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', marginTop: '0.5rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Tiêu đề:</span>
                  <strong style={{ lineHeight: '1.4' }}>{request.title}</strong>
                </div>
                {request.budget && (
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Ngân sách:</span>
                    <strong>{request.budget}</strong>
                  </div>
                )}
              </div>
              <Link
                href={isAdmin ? `/admin/quan-ly-yeu-cau/${request.id}` : `/yeu-cau/${request.id}`}
                className="btn btn-outline"
                style={{ width: '100%', marginTop: '1.5rem', padding: '0.5rem', fontSize: '0.9rem' }}
              >
                Xem chi tiết
              </Link>
            </div>
          )}

          {/* Box Thanh toán (cho User) */}
          {!isAdmin && request && !request.is_paid && (
            <div className="card" style={{ padding: '1.5rem', background: 'linear-gradient(to bottom right, #ffffff, #f8fafc)', border: '2px dashed var(--border)' }}>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem', textAlign: 'center' }}>Thanh toán đơn hàng</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textAlign: 'center', marginBottom: '1.5rem' }}>
                Quét mã QR bên dưới để thanh toán. Admin sẽ xác nhận sau khi nhận được tiền.
              </p>
              <div style={{ background: 'white', padding: '1rem', borderRadius: '0.5rem', border: '1px solid var(--border)', display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
                <svg width="150" height="150" viewBox="0 0 24 24" fill="none" stroke="var(--text)" strokeWidth="1">
                  <rect x="3" y="3" width="7" height="7"></rect>
                  <rect x="14" y="3" width="7" height="7"></rect>
                  <rect x="14" y="14" width="7" height="7"></rect>
                  <rect x="3" y="14" width="7" height="7"></rect>
                  <rect x="7" y="7" width="10" height="10"></rect>
                </svg>
              </div>
              <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <div style={{ fontSize: '0.9rem' }}><span style={{ color: 'var(--text-muted)' }}>Số tiền:</span> <strong style={{ color: 'var(--primary)', fontSize: '1.1rem' }}>{request.budget || 'Liên hệ Admin'}</strong></div>
                <div style={{ fontSize: '0.9rem' }}><span style={{ color: 'var(--text-muted)' }}>Ngân hàng:</span> <strong>Vietcombank</strong></div>
                <div style={{ fontSize: '0.9rem' }}><span style={{ color: 'var(--text-muted)' }}>STK:</span> <strong>0123456789</strong></div>
                <div style={{ fontSize: '0.9rem' }}><span style={{ color: 'var(--text-muted)' }}>Nội dung:</span> <strong>THANHTOAN {request.id?.slice(0, 8)}</strong></div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
    )}
    </ProtectedRoute>
  )
}
