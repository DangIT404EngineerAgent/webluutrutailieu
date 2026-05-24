'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import { useAuth } from '@/lib/auth-context'
import ProtectedRoute from '@/components/ProtectedRoute'

export default function ChatChung() {
  const { user, profile, supabase } = useAuth()
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [roomId, setRoomId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [chatError, setChatError] = useState('')
  const messagesEndRef = useRef(null)
  const channelRef = useRef(null)
  const pollingRef = useRef(null)
  const lastMessageTimeRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  // Hàm fetch tin nhắn mới (dùng cho polling)
  const fetchNewMessages = useCallback(async (currentRoomId) => {
    if (!currentRoomId || !supabase) return

    try {
      let query = supabase
        .from('chat_messages')
        .select('*, profiles(full_name, role)')
        .eq('room_id', currentRoomId)
        .order('created_at', { ascending: true })

      // Chỉ lấy tin nhắn mới hơn tin nhắn cuối cùng
      if (lastMessageTimeRef.current) {
        query = query.gt('created_at', lastMessageTimeRef.current)
      }

      const { data: newMsgs, error } = await query.limit(50)

      if (error) {
        console.error('Polling error:', error.message)
        return
      }

      if (newMsgs && newMsgs.length > 0) {
        setMessages(prev => {
          const existingIds = new Set(prev.map(m => m.id))
          const uniqueNewMsgs = newMsgs.filter(m => !existingIds.has(m.id))
          if (uniqueNewMsgs.length === 0) return prev
          
          const updated = [...prev, ...uniqueNewMsgs]
          // Cập nhật thời gian tin nhắn mới nhất
          lastMessageTimeRef.current = updated[updated.length - 1].created_at
          return updated
        })
      }
    } catch (err) {
      console.error('Polling fetch error:', err)
    }
  }, [supabase])

  useEffect(() => {
    if (!user || !supabase) return
    let isMounted = true

    const initChat = async () => {
      try {
        setLoading(true)
        setChatError('')

        // Tìm phòng chat public
        const { data: rooms, error: roomError } = await supabase
          .from('chat_rooms')
          .select('id')
          .eq('type', 'public')
          .limit(1)

        if (roomError) {
          console.error('Lỗi fetch chat room:', roomError.message)
          if (isMounted) {
            setChatError('Không thể tải phòng chat. Vui lòng thử lại sau.')
            setLoading(false)
          }
          return
        }

        let actualRoomId = null

        if (!rooms || rooms.length === 0) {
          if (profile?.role === 'admin') {
            const { data: newRoom, error: createError } = await supabase
              .from('chat_rooms')
              .insert([{ type: 'public', name: 'Kênh Chat Tổng' }])
              .select()
              .single()

            if (createError || !newRoom) {
              if (isMounted) {
                setChatError('Phòng chat chung chưa được tạo và không thể tự tạo.')
                setLoading(false)
              }
              return
            }
            actualRoomId = newRoom.id
          } else {
            if (isMounted) {
              setChatError('Phòng chat chung chưa được tạo. Liên hệ Admin để tạo.')
              setLoading(false)
            }
            return
          }
        } else {
          actualRoomId = rooms[0].id
        }

        if (isMounted) setRoomId(actualRoomId)

        // Fetch toàn bộ tin nhắn
        const { data: msgs, error: msgError } = await supabase
          .from('chat_messages')
          .select('*, profiles(full_name, role)')
          .eq('room_id', actualRoomId)
          .order('created_at', { ascending: true })
          .limit(100)

        if (msgError) {
          console.error('Lỗi fetch messages:', msgError.message)
        }

        if (isMounted) {
          const allMsgs = msgs || []
          setMessages(allMsgs)
          if (allMsgs.length > 0) {
            lastMessageTimeRef.current = allMsgs[allMsgs.length - 1].created_at
          }
          setLoading(false)
        }

        // === REALTIME: Thử dùng postgres_changes ===
        if (channelRef.current) {
          supabase.removeChannel(channelRef.current)
        }

        channelRef.current = supabase
          .channel(`public-chat-${actualRoomId}`)
          .on('postgres_changes', {
            event: 'INSERT',
            schema: 'public',
            table: 'chat_messages',
            filter: `room_id=eq.${actualRoomId}`,
          }, async (payload) => {
            if (!isMounted) return
            const { data: senderProfile } = await supabase
              .from('profiles')
              .select('full_name, role')
              .eq('id', payload.new.sender_id)
              .single()

            const newMsg = {
              ...payload.new,
              profiles: senderProfile,
            }

            setMessages(prev => {
              if (prev.some(m => m.id === newMsg.id)) return prev
              const updated = [...prev, newMsg]
              lastMessageTimeRef.current = newMsg.created_at
              return updated
            })
          })
          .subscribe()

        // === POLLING BACKUP: Nếu Realtime không hoạt động ===
        // Poll mỗi 3 giây để đảm bảo luôn nhận tin nhắn mới
        if (pollingRef.current) clearInterval(pollingRef.current)
        pollingRef.current = setInterval(() => {
          if (isMounted) fetchNewMessages(actualRoomId)
        }, 3000)

      } catch (err) {
        console.error('Chat init error:', err)
        if (isMounted) {
          setChatError('Đã xảy ra lỗi hệ thống khi kết nối chat.')
          setLoading(false)
        }
      }
    }

    initChat()

    return () => {
      isMounted = false
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current)
      }
      if (pollingRef.current) {
        clearInterval(pollingRef.current)
      }
    }
  }, [user?.id, profile, supabase, fetchNewMessages])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSend = async (e) => {
    e.preventDefault()
    if (!input.trim() || !roomId || !user) return

    const currentInput = input.trim()
    setInput('')

    const { data: newMsg, error } = await supabase
      .from('chat_messages')
      .insert([{
        room_id: roomId,
        sender_id: user.id,
        content: currentInput,
      }])
      .select('*, profiles(full_name, role)')
      .single()

    if (!error && newMsg) {
      setMessages(prev => {
        if (prev.some(m => m.id === newMsg.id)) return prev
        const updated = [...prev, newMsg]
        lastMessageTimeRef.current = newMsg.created_at
        return updated
      })
    } else if (error) {
      console.error('Lỗi gửi tin nhắn:', error.message)
      alert('Không thể gửi tin nhắn. Vui lòng thử lại.')
      setInput(currentInput)
    }
  }

  return (
    <ProtectedRoute>
      <div className="container" style={{ height: 'calc(100vh - 100px)', display: 'flex', flexDirection: 'column', paddingTop: '1rem', paddingBottom: '1rem' }}>
        <div className="page-header" style={{ marginBottom: '1rem' }}>
          <h1 className="page-title">Cộng Đồng (Chat Tổng)</h1>
          <p className="page-description">Giao lưu, hỏi bài và chia sẻ kinh nghiệm cùng mọi người.</p>
        </div>

        <div className="card" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', padding: 0 }}>
          {/* Chat Header */}
          <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border)', background: 'rgba(248, 250, 252, 0.5)' }}>
            <h3 style={{ fontSize: '1.1rem', margin: 0 }}># Phòng chat chung</h3>
            <span style={{ fontSize: '0.85rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.2rem' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', display: 'inline-block' }}></span>
              Kết nối Realtime
            </span>
          </div>

          {/* Chat Messages */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {loading ? (
              <p style={{ textAlign: 'center', color: 'var(--text-muted)', margin: 'auto' }}>Đang tải tin nhắn...</p>
            ) : chatError ? (
              <div style={{ margin: 'auto', textAlign: 'center' }}>
                <p style={{ color: '#ef4444', marginBottom: '1rem' }}>{chatError}</p>
                <button onClick={() => window.location.reload()} className="btn btn-outline">Thử lại</button>
              </div>
            ) : messages.length === 0 ? (
              <p style={{ textAlign: 'center', color: 'var(--text-muted)', margin: 'auto' }}>Chưa có tin nhắn nào. Hãy là người đầu tiên bắt đầu cuộc trò chuyện! 🎉</p>
            ) : messages.map(msg => {
              const isMe = msg.sender_id === user?.id
              const isAdminMsg = msg.profiles?.role === 'admin'
              return (
                <div key={msg.id} style={{ display: 'flex', flexDirection: 'column', alignItems: isMe ? 'flex-end' : 'flex-start' }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginBottom: '0.25rem' }}>
                    <span style={{ fontWeight: '600', fontSize: '0.9rem', color: isAdminMsg ? 'var(--primary)' : 'var(--text)' }}>
                      {isAdminMsg && '🛡️ '}
                      {msg.profiles?.full_name || 'Người dùng ẩn danh'}
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

          {/* Chat Input */}
          <div style={{ padding: '1rem', borderTop: '1px solid var(--border)', background: 'var(--card-bg)' }}>
            <form onSubmit={handleSend} style={{ display: 'flex', gap: '0.75rem' }}>
              <input
                type="text"
                className="form-input"
                placeholder="Nhập tin nhắn để giao lưu cùng cộng đồng..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                style={{ flex: 1, marginBottom: 0 }}
                disabled={!roomId || loading || chatError !== ''}
              />
              <button type="submit" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 1.5rem' }} disabled={!roomId || loading || chatError !== ''}>
                Gửi
              </button>
            </form>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}
