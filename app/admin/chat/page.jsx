'use client'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'
import ProtectedRoute from '@/components/ProtectedRoute'

export default function AdminChatHub() {
  const { user, supabase } = useAuth()
  const [chatRooms, setChatRooms] = useState([])
  const [activeChat, setActiveChat] = useState(null)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loadingRooms, setLoadingRooms] = useState(true)
  const [loadingMessages, setLoadingMessages] = useState(false)

  const messagesEndRef = useRef(null)
  const channelRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  // Lấy danh sách phòng chat
  useEffect(() => {
    if (!user || !supabase) return

    const fetchRooms = async () => {
      const { data, error } = await supabase
        .from('chat_rooms')
        .select('*, document_requests(id, title), profiles:user_id(full_name), chat_messages(content, created_at)')
        .eq('type', 'private')
        .order('created_at', { ascending: false })

      if (data) {
        const rooms = data.map(room => {
          const sortedMsgs = (room.chat_messages || []).sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
          const lastMsg = sortedMsgs[0]
          
          return {
            ...room,
            userName: room.profiles?.full_name || 'Người dùng ẩn danh',
            lastMessage: lastMsg?.content || 'Chưa có tin nhắn',
            lastTime: lastMsg?.created_at 
              ? new Date(lastMsg.created_at).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) 
              : '',
          }
        })
        setChatRooms(rooms)
        
        if (rooms.length > 0 && !activeChat) {
          setActiveChat(rooms[0].id)
        }
      }
      setLoadingRooms(false)
    }

    fetchRooms()
  }, [user, supabase])

  // Lấy tin nhắn & bật realtime cho phòng đang chọn
  useEffect(() => {
    if (!activeChat || !supabase) return
    let isMounted = true

    const initChat = async () => {
      setLoadingMessages(true)
      
      const { data: msgs, error } = await supabase
        .from('chat_messages')
        .select('*, profiles(full_name, role)')
        .eq('room_id', activeChat)
        .order('created_at', { ascending: true })

      if (isMounted) {
        setMessages(msgs || [])
        setLoadingMessages(false)
      }

      if (!isMounted) return

      if (channelRef.current) {
        supabase.removeChannel(channelRef.current)
      }

      channelRef.current = supabase
        .channel(`admin-chat-${activeChat}`)
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `room_id=eq.${activeChat}`,
        }, async (payload) => {
          const { data: senderProfile } = await supabase
            .from('profiles')
            .select('full_name, role')
            .eq('id', payload.new.sender_id)
            .single()

          if (isMounted) {
            setMessages(prev => {
              if (prev.some(m => m.id === payload.new.id)) return prev
              return [...prev, { ...payload.new, profiles: senderProfile }]
            })
          }
        })
        .subscribe()
    }

    initChat()

    return () => {
      isMounted = false
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current)
      }
    }
  }, [activeChat, supabase])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSend = async (e) => {
    e.preventDefault()
    if (!input.trim() || !activeChat || !user) return

    const currentInput = input.trim()
    setInput('') // UX: xoá text ngay khi nhấn gửi

    const { data: newMsg, error } = await supabase
      .from('chat_messages')
      .insert([{
        room_id: activeChat,
        sender_id: user.id,
        content: currentInput,
      }])
      .select('*, profiles(full_name, role)')
      .single()

    if (!error && newMsg) {
      // Cập nhật messages
      setMessages(prev => {
        if (prev.some(m => m.id === newMsg.id)) return prev
        return [...prev, newMsg]
      })
      
      // Cập nhật sidebar
      setChatRooms(prev => prev.map(room => 
        room.id === activeChat 
          ? { ...room, lastMessage: currentInput, lastTime: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) } 
          : room
      ))
    } else if (error) {
      console.error('Lỗi gửi tin nhắn:', error.message)
      alert('Gửi thất bại, vui lòng thử lại!')
      setInput(currentInput)
    }
  }

  const activeRoomData = chatRooms.find(r => r.id === activeChat)

  return (
    <ProtectedRoute adminOnly={true}>
      <div style={{ height: 'calc(100vh - 100px)', display: 'flex', flexDirection: 'column', padding: '1rem', background: 'var(--background)' }}>
        <h1 className="page-title" style={{ fontSize: '1.8rem', marginBottom: '1.5rem', color: 'var(--text)' }}>Hộp Thư Yêu Cầu</h1>
        
        <div className="card" style={{ padding: 0, display: 'flex', flex: 1, overflow: 'hidden', border: '1px solid var(--border)', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.05)' }}>
          
          {/* Sidebar Left: Danh sách phòng chat */}
          <div style={{ width: '350px', borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', background: 'var(--background)' }}>
            <div style={{ padding: '1.25rem', borderBottom: '1px solid var(--border)', background: 'var(--card-bg)' }}>
              <input type="text" className="form-input" placeholder="Tìm kiếm tin nhắn..." style={{ margin: 0, borderRadius: '2rem', padding: '0.6rem 1.25rem' }} />
            </div>
            
            <div style={{ flex: 1, overflowY: 'auto', background: 'var(--background)' }}>
              {loadingRooms ? (
                <p style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>Đang tải danh sách...</p>
              ) : chatRooms.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
                  <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📭</div>
                  <p style={{ color: 'var(--text-muted)' }}>Chưa có tin nhắn nào.</p>
                </div>
              ) : (
                chatRooms.map(room => (
                  <div 
                    key={room.id}
                    onClick={() => setActiveChat(room.id)}
                    style={{ 
                      padding: '1.25rem', 
                      borderBottom: '1px solid var(--border)', 
                      cursor: 'pointer',
                      background: activeChat === room.id ? 'var(--card-bg)' : 'transparent',
                      borderLeft: activeChat === room.id ? '4px solid var(--primary)' : '4px solid transparent',
                      transition: 'all 0.2s',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                      <strong style={{ fontSize: '1.05rem', color: activeChat === room.id ? 'var(--primary)' : 'var(--text)' }}>{room.userName}</strong>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', background: 'var(--background)', padding: '0.2rem 0.5rem', borderRadius: '1rem' }}>{room.lastTime}</span>
                    </div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <span style={{ padding: '0.1rem 0.4rem', background: '#e0e7ff', color: '#4338ca', borderRadius: '0.25rem', fontSize: '0.7rem' }}>Yêu cầu</span>
                      <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{room.document_requests?.title || 'Chưa rõ'}</span>
                    </div>
                    <p style={{ fontSize: '0.9rem', color: activeChat === room.id ? 'var(--text)' : 'var(--text-muted)', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {room.lastMessage}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Khung Chat Right */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'var(--card-bg)' }}>
            {!activeChat ? (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                <div style={{ fontSize: '4rem', marginBottom: '1rem', opacity: 0.5 }}>💬</div>
                <p style={{ fontSize: '1.1rem' }}>Chọn một cuộc hội thoại bên trái để bắt đầu hỗ trợ.</p>
              </div>
            ) : (
              <>
                {/* Chat Header */}
                <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--card-bg)' }}>
                  <div>
                    <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.2rem' }}>
                      {activeRoomData?.userName || 'Người dùng'}
                      <span style={{ width: '8px', height: '8px', background: '#10b981', borderRadius: '50%', display: 'inline-block' }}></span>
                    </h3>
                    <p style={{ margin: '0.35rem 0 0 0', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                      Đang xử lý yêu cầu: <strong>{activeRoomData?.document_requests?.title || 'Chưa có tiêu đề'}</strong>
                    </p>
                  </div>
                  {activeRoomData?.request_id && (
                    <Link href={`/admin/quan-ly-yeu-cau/${activeRoomData.request_id}`} className="btn btn-outline" style={{ padding: '0.5rem 1rem', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem', borderRadius: '2rem' }}>
                      📝 Xem Đơn Yêu Cầu
                    </Link>
                  )}
                </div>

                {/* Chat Messages */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', background: '#f8fafc' }}>
                  {loadingMessages ? (
                    <div style={{ margin: 'auto', textAlign: 'center' }}>
                      <div style={{ width: '30px', height: '30px', border: '3px solid var(--border)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 1rem auto' }}></div>
                      <p style={{ color: 'var(--text-muted)' }}>Đang tải tin nhắn...</p>
                    </div>
                  ) : messages.length === 0 ? (
                    <div style={{ margin: 'auto', textAlign: 'center', padding: '2rem', background: 'white', borderRadius: '1rem', border: '1px dashed var(--border)' }}>
                      <p style={{ color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Chưa có tin nhắn nào trong phòng này.</p>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Hãy gửi tin nhắn đầu tiên để hỗ trợ người dùng!</p>
                    </div>
                  ) : (
                    messages.map((msg, idx) => {
                      const isMe = msg.sender_id === user?.id
                      return (
                        <div key={msg.id || idx} style={{ 
                          display: 'flex', 
                          flexDirection: 'column', 
                          alignItems: isMe ? 'flex-end' : 'flex-start' 
                        }}>
                          {!isMe && (
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.35rem', marginLeft: '0.5rem' }}>
                              {msg.profiles?.full_name || 'Người dùng'}
                            </span>
                          )}
                          <div style={{ 
                            maxWidth: '75%', 
                            padding: '0.85rem 1.25rem', 
                            borderRadius: '1.25rem',
                            background: isMe ? 'var(--primary)' : 'white',
                            color: isMe ? 'white' : 'var(--text)',
                            border: isMe ? 'none' : '1px solid var(--border)',
                            borderBottomRightRadius: isMe ? '0.25rem' : '1.25rem',
                            borderBottomLeftRadius: isMe ? '1.25rem' : '0.25rem',
                            lineHeight: '1.5',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
                          }}>
                            {msg.content}
                          </div>
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
                            {new Date(msg.created_at).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      )
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Chat Input */}
                <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid var(--border)', background: 'white' }}>
                  <form onSubmit={handleSend} style={{ display: 'flex', gap: '0.75rem' }}>
                    <input 
                      type="text" 
                      className="form-input" 
                      placeholder="Nhập tin nhắn hỗ trợ..." 
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      style={{ flex: 1, margin: 0, padding: '0.85rem 1.25rem', borderRadius: '2rem', background: 'var(--background)' }}
                      disabled={loadingMessages}
                    />
                    <button type="submit" className="btn btn-primary" style={{ padding: '0 1.5rem', borderRadius: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 'bold' }} disabled={loadingMessages}>
                      <span>Gửi</span>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="22" y1="2" x2="11" y2="13"></line>
                        <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                      </svg>
                    </button>
                  </form>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}} />
    </ProtectedRoute>
  )
}
