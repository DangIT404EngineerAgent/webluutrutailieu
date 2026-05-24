import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'

export async function updateSession(request) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Lấy thông tin user hiện tại (refresh token nếu cần)
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Nếu chưa đăng nhập và truy cập route cần auth -> redirect về đăng nhập
  const protectedPaths = ['/ho-so', '/tai-lieu-cua-toi', '/yeu-cau', '/chat-chung', '/chat-rieng']
  const isProtected = protectedPaths.some(path => request.nextUrl.pathname.startsWith(path))

  if (!user && isProtected) {
    const url = request.nextUrl.clone()
    url.pathname = '/dang-nhap'
    return NextResponse.redirect(url)
  }

  // Kiểm tra quyền Admin cho các route /admin
  if (request.nextUrl.pathname.startsWith('/admin')) {
    if (!user) {
      const url = request.nextUrl.clone()
      url.pathname = '/dang-nhap'
      return NextResponse.redirect(url)
    }

    // Lấy role từ bảng profiles
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || profile.role !== 'admin') {
      const url = request.nextUrl.clone()
      url.pathname = '/'
      return NextResponse.redirect(url)
    }
  }

  // Nếu đã đăng nhập mà vào trang đăng nhập/đăng ký -> redirect về trang chủ
  if (user && (request.nextUrl.pathname === '/dang-nhap' || request.nextUrl.pathname === '/dang-ky')) {
    const url = request.nextUrl.clone()
    url.pathname = '/'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}
