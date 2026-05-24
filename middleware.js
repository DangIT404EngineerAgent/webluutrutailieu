// Middleware đơn giản - auth được xử lý hoàn toàn ở client-side
// Giữ file này cho các route server-side nếu cần trong tương lai

export function middleware() {
  // Không cần xử lý gì - auth tokens được lưu trong localStorage
  // và quản lý hoàn toàn bởi @supabase/supabase-js ở client-side
}

export const config = {
  matcher: [],
}
