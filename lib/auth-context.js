'use client'

import { createContext, useContext, useEffect, useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'

const AuthContext = createContext(null)

// Keys cho localStorage cache
const CACHE_USER_KEY = 'edudocs-cached-user'
const CACHE_PROFILE_KEY = 'edudocs-cached-profile'

// Đọc cache từ localStorage (an toàn cho SSR)
function getCachedData(key) {
  if (typeof window === 'undefined') return null
  try {
    const cached = localStorage.getItem(key)
    return cached ? JSON.parse(cached) : null
  } catch {
    return null
  }
}

// Lưu cache vào localStorage
function setCachedData(key, data) {
  if (typeof window === 'undefined') return
  try {
    if (data) {
      localStorage.setItem(key, JSON.stringify(data))
    } else {
      localStorage.removeItem(key)
    }
  } catch {
    // Bỏ qua lỗi storage
  }
}

export function AuthProvider({ children }) {
  // Khởi tạo luôn giống server: loading=true, user/profile=null
  // → Tránh lỗi hydration mismatch
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  const supabaseRef = useRef(null)
  const initDoneRef = useRef(false)

  // Đảm bảo chỉ tạo 1 instance supabase duy nhất
  if (!supabaseRef.current) {
    supabaseRef.current = createClient()
  }
  const supabase = supabaseRef.current

  useEffect(() => {
    let isMounted = true

    // Đọc cache ngay lập tức (đồng bộ) để hiển thị UI nhanh nhất có thể
    const cachedUser = getCachedData(CACHE_USER_KEY)
    const cachedProfile = getCachedData(CACHE_PROFILE_KEY)
    if (cachedUser) {
      setUser(cachedUser)
      setProfile(cachedProfile)
      setLoading(false)
    }

    const fetchProfile = async (userId) => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single()

        if (error && error.code !== 'PGRST116') {
          console.error('Profile fetch error:', error.message)
        }
        return data || null
      } catch (err) {
        console.error('Error fetching profile:', err)
        return null
      }
    }

    const handleAuthUser = async (sessionUser) => {
      if (!isMounted) return

      if (sessionUser) {
        setUser(sessionUser)
        setCachedData(CACHE_USER_KEY, {
          id: sessionUser.id,
          email: sessionUser.email,
        })

        const profileData = await fetchProfile(sessionUser.id)
        if (isMounted) {
          setProfile(profileData)
          setCachedData(CACHE_PROFILE_KEY, profileData)
        }
      } else {
        setUser(null)
        setProfile(null)
        setCachedData(CACHE_USER_KEY, null)
        setCachedData(CACHE_PROFILE_KEY, null)
      }

      if (isMounted) setLoading(false)
    }

    const initializeAuth = async () => {
      if (initDoneRef.current) return
      initDoneRef.current = true

      try {
        // getSession() đọc từ localStorage - nhanh, không cần network
        const { data: { session } } = await supabase.auth.getSession()
        await handleAuthUser(session?.user ?? null)
      } catch (err) {
        console.error('Auth init error:', err)
        if (isMounted) {
          setUser(null)
          setProfile(null)
          setLoading(false)
          setCachedData(CACHE_USER_KEY, null)
          setCachedData(CACHE_PROFILE_KEY, null)
        }
      }
    }

    initializeAuth()

    // Lắng nghe mọi thay đổi auth state
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!isMounted) return

        // Bỏ qua INITIAL_SESSION vì đã xử lý ở initializeAuth
        if (event === 'INITIAL_SESSION') return

        await handleAuthUser(session?.user ?? null)
      }
    )

    return () => {
      isMounted = false
      subscription?.unsubscribe()
    }
  }, [supabase])

  const signOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setProfile(null)
    setCachedData(CACHE_USER_KEY, null)
    setCachedData(CACHE_PROFILE_KEY, null)
  }

  const value = {
    user,
    profile,
    loading,
    signOut,
    supabase,
    isAdmin: profile?.role === 'admin',
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth phải được sử dụng bên trong AuthProvider')
  }
  return context
}
