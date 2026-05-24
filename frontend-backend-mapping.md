# Tài liệu Đặc tả Tích hợp (Frontend - Backend Integration Blueprint)

## 1. Tổng quan Kiến trúc
* **Frontend:** Next.js (App Router).
* **Backend:** Supabase (PostgreSQL, Auth, Storage, Realtime).
* **Mục tiêu:** Tài liệu này giúp AI Developer hiểu rõ toàn bộ cấu trúc dự án hiện tại, ánh xạ chính xác các route Frontend với các bảng CSDL (được định nghĩa trong `database.md`), nhằm triển khai logic Backend (Supabase) một cách đầy đủ và không bỏ sót.

## 2. Cấu trúc thư mục Frontend & Ánh xạ Database
* `app/ho-so` ↔️ Bảng `profiles`
* `app/kho-tai-lieu` ↔️ Bảng `documents`, `categories`
* `app/tai-lieu-cua-toi` ↔️ Bảng `documents`
* `app/yeu-cau` ↔️ Bảng `document_requests`
* `app/chat-chung`, `app/chat-rieng` ↔️ Bảng `chat_rooms`, `chat_messages`
* `app/admin/...` ↔️ Quản trị toàn bộ các bảng trên.

## 3. Yêu cầu Backend chi tiết theo từng trang (Page-by-Page)

### 3.1. Nhóm Xác thực & Hồ sơ người dùng (Profiles)
#### `app/dang-nhap/page.jsx` & `app/dang-ky/page.jsx`
* **Mục đích:** Đăng ký và Đăng nhập.
* **Backend Task:**
  * Dùng `supabase.auth.signInWithPassword` và `signUp`.
  * **Đặc biệt:** Khi user đăng ký mới, trigger `handle_new_user()` trong DB sẽ tự động tạo một dòng trong bảng `profiles`. Frontend không cần gọi API insert profile thủ công.

#### `app/ho-so/page.jsx`
* **Mục đích:** Hiển thị và chỉnh sửa thông tin người dùng (`full_name`, `avatar_url`, `role`...).
* **Backend Task:**
  * **READ:** Fetch dữ liệu từ bảng `profiles` dựa trên `auth.uid()`.
  * **UPDATE:** Cập nhật `full_name`, `avatar_url` (nếu có upload ảnh lên Storage bucket `avatars`). Không cho phép user thường tự update `role`.
* **RLS Policy:** Dựa vào policy `"Users can update own profile."`

### 3.2. Nhóm Kho Tài liệu & Xem tài liệu (Documents)
#### `app/kho-tai-lieu/page.jsx`
* **Mục đích:** Hiển thị danh sách tài liệu công khai có phân trang và lọc theo danh mục.
* **Backend Task (READ):** 
  * Query bảng `documents` với điều kiện `is_public = true`.
  * Join với bảng `categories` để hiển thị tên danh mục.
  * Sắp xếp theo `created_at` giảm dần.

#### `app/kho-tai-lieu/[id]/page.jsx`
* **Mục đích:** Xem chi tiết tài liệu, hiển thị iframe xem trước (PDF/Video) và nút tải gốc.
* **Backend Task:**
  * **READ:** Fetch document theo `id`. Kèm join `categories`.
  * **STORAGE:** Get Public URL cho `preview_file_path` (đưa vào iframe) và `file_path` (để tải về).
* **Lưu ý RLS:** Tài liệu public thì ai cũng xem được. Nếu tài liệu `is_public = false`, query sẽ trả về null (trừ khi `owner_id = auth.uid()` hoặc user có role 'admin').

#### `app/tai-lieu-cua-toi/page.jsx`
* **Mục đích:** Nơi user tải các tài liệu được Admin làm riêng (Private).
* **Backend Task (READ):** 
  * Query bảng `documents` với `is_public = false` VÀ `owner_id = auth.uid()`.

### 3.3. Nhóm Yêu cầu làm tài liệu (Requests)
#### `app/yeu-cau/page.jsx`
* **Mục đích:** Form người dùng đặt hàng làm tài liệu.
* **Backend Task (INSERT):** 
  * Ghi vào bảng `document_requests`.
  * Data: `title`, `description`, `target_level`, `format_needed`, `deadline`, `budget`. 
  * Auth UID tự động gán cho `user_id` qua Supabase Auth.
* **Hậu kỳ:** Khi tạo request mới, tự động tạo một `chat_rooms` private gắn với `request_id` này để Admin và User nhắn tin.

#### `app/yeu-cau/lich-su/page.jsx` & `app/yeu-cau/[id]/page.jsx`
* **Mục đích:** Xem tiến độ xử lý và tải file khi hoàn thành.
* **Backend Task (READ):** 
  * Query bảng `document_requests` với `user_id = auth.uid()`.
  * Nếu `status == 'completed'` và `fulfilled_document_id` có dữ liệu, join bảng `documents` để lấy file trả kết quả.

### 3.4. Nhóm Trò chuyện (Chat System)
#### `app/chat-chung/page.jsx`
* **Mục đích:** Phòng chat cộng đồng.
* **Backend Task:**
  * Lấy `room_id` có `type = 'public'` từ bảng `chat_rooms`.
  * **Realtime:** Lắng nghe bảng `chat_messages` filter theo `room_id`.
  * **INSERT:** Thêm message vào `chat_messages`.

#### `app/chat-rieng/[id]/page.jsx`
* **Mục đích:** Chat 1-1 giữa User và Admin để trao đổi về yêu cầu.
* **Backend Task:**
  * Query `chat_rooms` với `id` = params.id. Đảm bảo RLS cho phép truy cập.
  * Realtime CRUD vào `chat_messages`.

### 3.5. Nhóm Quản trị Admin (`app/admin/...`)
* **Lưu ý chung:** Tất cả route bắt đầu bằng `/admin/` cần có Middleware kiểm tra Auth và role là `'admin'` trong bảng `profiles`.

#### `app/admin/quan-ly-danh-muc/page.jsx`
* **Backend Task (CRUD):** Thao tác toàn quyền với bảng `categories`.

#### `app/admin/quan-ly-nguoi-dung/page.jsx`
* **Backend Task (READ/UPDATE):** Truy vấn toàn bộ bảng `profiles`. Cập nhật `role` (VD: cấp quyền admin/teacher).

#### `app/admin/quan-ly-tai-lieu/...` (Thêm mới & Chỉnh sửa)
* **Mục đích:** Upload tài liệu (Công khai hoặc Riêng tư).
* **Backend Task (INSERT/UPDATE & STORAGE):**
  * Tải file gốc lên Storage (`documents/original/...`), lưu đường dẫn vào `file_path`.
  * **Cực kỳ quan trọng:** Nếu định dạng là Word/PowerPoint, Frontend đã có thêm UI yêu cầu Upload bản xem trước PDF. Backend phải tải file này lên Storage (`documents/preview/...`) và lưu vào trường `preview_file_path`. Nếu là định dạng PDF hoặc Video thì `preview_file_path` gán bằng `file_path`.
  * Cập nhật `is_public`, `owner_id` (nếu private).
  
#### `app/admin/quan-ly-yeu-cau/[id]/page.jsx`
* **Mục đích:** Quản lý tiến trình của một Yêu cầu.
* **Backend Task:**
  * **UPDATE:** Cập nhật `status` ('pending', 'processing', 'completed'...). Cập nhật `is_paid` (true/false).
  * **Trả file hoàn thành:** Admin upload một file lên Storage, sau đó tạo một bản ghi Private trong bảng `documents` gắn `owner_id = request.user_id`. Cuối cùng update `fulfilled_document_id` của bảng `document_requests` bằng ID của document vừa tạo.

## 4. Chiến lược Triển khai (Implementation Strategy)
Khi bắt đầu code, AI nên thực hiện theo lộ trình sau để đảm bảo logic liên kết chặt chẽ:
1. **Pha 1 (Hạ tầng):** Thiết lập Supabase Client (Server & Client components). Viết Auth flow (Login, Register, Logout) + Middleware chặn route Admin.
2. **Pha 2 (Dữ liệu nền tảng):** Xử lý API cho bảng `categories` và trang Hồ sơ người dùng (`profiles`).
3. **Pha 3 (Quản lý File & Tài liệu):** Xử lý upload Storage trong phần Admin. Sau đó render kho tài liệu công khai (`kho-tai-lieu`). Nhớ xử lý kỹ vụ `preview_file_path` cho file Word/PPT.
4. **Pha 4 (Quy trình Yêu cầu):** Code luồng Đặt Yêu cầu -> Admin duyệt -> Admin upload file trả kết quả -> User vào mục Tài liệu của tôi để xem.
5. **Pha 5 (Realtime Chat):** Cuối cùng, kết nối Supabase Realtime cho phòng chat chung và chat riêng theo `request_id`.
