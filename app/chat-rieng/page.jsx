'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'
import ProtectedRoute from '@/components/ProtectedRoute'

export default function DanhSachChatRieng() {
  const { user, supabase, isAdmin } = useAuth()
  const [chatRooms, setChatRooms] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return

    const fetchRooms = async () => {
      let query = supabase
        .from('chat_rooms')
        .select('*, document_requests(title, status), chat_messages(content, created_at)')
        .eq('type', 'private')
        .order('created_at', { ascending: false })

      // Nếu không phải admin, chỉ lấy phòng của chính mình
      if (!isAdmin) {
        query = query.eq('user_id', user.id)
      }

      const { data } = await query

      if (data) {
        // Map data với tin nhắn cuối cùng
        const rooms = data.map(room => {
          const lastMsg = room.chat_messages?.sort((a, b) =>
            new Date(b.created_at) - new Date(a.created_at)
          )?.[0]

          return {
            ...room,
            lastMessage: lastMsg?.content || 'Chưa có tin nhắn',
            lastTime: lastMsg?.created_at
              ? new Date(lastMsg.created_at).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' })
              : '',
          }
        })
        setChatRooms(rooms)
      }
      setLoading(false)
    }
    fetchRooms()
  }, [user, isAdmin])

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
    ) : (
    <div className="container" style={{ padding: '4rem 1rem' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '2rem', textAlign: 'center' }}>Tin nhắn trực tiếp</h1>

        {chatRooms.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
            <p style={{ color: 'var(--text-muted)' }}>Chưa có phòng chat nào. Phòng chat sẽ được tạo tự động khi bạn gửi yêu cầu tài liệu.</p>
            <Link href="/yeu-cau" className="btn btn-primary" style={{ marginTop: '1rem' }}>Gửi Yêu Cầu</Link>
          </div>
        ) : (
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            {chatRooms.map((room, idx) => (
              <Link
                href={`/chat-rieng/${room.id}`}
                key={room.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '1.5rem',
                  borderBottom: idx === chatRooms.length - 1 ? 'none' : '1px solid var(--border)',
                  textDecoration: 'none',
                  color: 'inherit',
                  transition: 'background 0.2s',
                }}
              >
                <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '1.2rem', marginRight: '1.5rem', flexShrink: 0 }}>
                  {isAdmin ? 'U' : 'AD'}
                </div>
                <div style={{ flex: 1, overflow: 'hidden' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <h3 style={{ fontSize: '1.1rem', margin: 0 }}>
                      {room.document_requests?.title || room.name || 'Phòng chat'}
                    </h3>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      {room.lastTime}
                    </span>
                  </div>
                  <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.95rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '400px' }}>
                    {room.lastMessage}
                  </p>
                </div>
                <div style={{ marginLeft: '1rem' }}>
                  <span style={{ fontSize: '0.8rem', background: 'var(--background)', padding: '0.2rem 0.6rem', borderRadius: '1rem', color: 'var(--text-muted)' }}>
                    {getStatusLabel(room.document_requests?.status)}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
    )}
    </ProtectedRoute>
  )
}
