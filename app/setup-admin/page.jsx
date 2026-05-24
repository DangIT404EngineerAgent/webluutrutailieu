'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function SetupAdmin() {
  const supabase = createClient()
  const [result, setResult] = useState('')
  const [loading, setLoading] = useState(false)

  const handleCreateAdmin = async () => {
    setLoading(true)
    setResult('')

    const adminEmail = 'admin@edudocs.vn'
    const adminPassword = 'Admin@123456'

    try {
      // Bước 1: Đăng ký tài khoản admin
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: adminEmail,
        password: adminPassword,
        options: {
          data: {
            full_name: 'Admin Hệ Thống',
          },
        },
      })

      if (signUpError) {
        // Nếu tài khoản đã tồn tại, thử đăng nhập
        if (signUpError.message.includes('already registered') || signUpError.message.includes('already been registered')) {
          setResult('⚠️ Email admin đã tồn tại. Thử đăng nhập để lấy user ID...')

          const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
            email: adminEmail,
            password: adminPassword,
          })

          if (signInError) {
            setResult('❌ Không thể đăng nhập admin: ' + signInError.message)
            setLoading(false)
            return
          }

          // Cập nhật role admin
          const { error: updateError } = await supabase
            .from('profiles')
            .update({ role: 'admin', full_name: 'Admin Hệ Thống' })
            .eq('id', signInData.user.id)

          if (updateError) {
            setResult('❌ Lỗi cập nhật role: ' + updateError.message + '\n\n💡 Bạn cần chạy SQL sau trong Supabase Dashboard > SQL Editor:\n\nUPDATE profiles SET role = \'admin\' WHERE id = \'' + signInData.user.id + '\';')
          } else {
            setResult('✅ Đã cập nhật tài khoản admin thành công!\n\n📧 Email: ' + adminEmail + '\n🔑 Mật khẩu: ' + adminPassword)
          }

          // Đăng xuất để test lại
          await supabase.auth.signOut()
          setLoading(false)
          return
        }

        setResult('❌ Lỗi đăng ký: ' + signUpError.message)
        setLoading(false)
        return
      }

      // Bước 2: Cập nhật role thành admin
      if (signUpData?.user) {
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ role: 'admin' })
          .eq('id', signUpData.user.id)

        if (updateError) {
          setResult('⚠️ Đã tạo tài khoản nhưng không thể cập nhật role admin.\n\n💡 Chạy SQL sau trong Supabase Dashboard > SQL Editor:\n\nUPDATE profiles SET role = \'admin\' WHERE id = \'' + signUpData.user.id + '\';\n\n📧 Email: ' + adminEmail + '\n🔑 Mật khẩu: ' + adminPassword)
        } else {
          setResult('✅ Tạo tài khoản admin thành công!\n\n📧 Email: ' + adminEmail + '\n🔑 Mật khẩu: ' + adminPassword)
        }

        // Đăng xuất sau khi tạo
        await supabase.auth.signOut()
      }
    } catch (err) {
      setResult('❌ Lỗi: ' + err.message)
    }

    setLoading(false)
  }

  return (
    <div className="container" style={{ maxWidth: '600px', marginTop: '3rem' }}>
      <div className="card" style={{ padding: '2rem', textAlign: 'center' }}>
        <h1 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>⚙️ Setup Tài Khoản Admin</h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
          Tạo tài khoản admin để quản lý hệ thống. Chỉ cần chạy 1 lần.
        </p>

        <div style={{ background: 'var(--background)', padding: '1.5rem', borderRadius: '0.5rem', marginBottom: '2rem', textAlign: 'left' }}>
          <p><strong>Email:</strong> admin@edudocs.vn</p>
          <p><strong>Mật khẩu:</strong> Admin@123456</p>
        </div>

        <button
          onClick={handleCreateAdmin}
          className="btn btn-primary"
          disabled={loading}
          style={{ width: '100%', padding: '1rem', fontSize: '1.1rem', opacity: loading ? 0.7 : 1 }}
        >
          {loading ? 'Đang tạo...' : '🚀 Tạo Tài Khoản Admin'}
        </button>

        {result && (
          <div style={{
            marginTop: '2rem',
            padding: '1.5rem',
            background: result.includes('✅') ? '#ecfdf5' : result.includes('⚠️') ? '#fefce8' : '#fef2f2',
            borderRadius: '0.5rem',
            textAlign: 'left',
            whiteSpace: 'pre-wrap',
            lineHeight: '1.8',
            fontSize: '0.95rem'
          }}>
            {result}
          </div>
        )}

        <p style={{ marginTop: '2rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          ⚠️ Sau khi tạo xong admin, nên xóa trang này hoặc bảo vệ nó.
        </p>
      </div>
    </div>
  )
}
