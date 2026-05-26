# 🎓 Trung Tâm Tài Liệu Giáo Dục - EduDocs

<div align="center">

![Next.js](https://img.shields.io/badge/Next.js-14.2-black?logo=next.js&logoColor=white)
![React](https://img.shields.io/badge/React-18.3-blue?logo=react&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-Latest-green?logo=supabase&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-yellow?logo=javascript&logoColor=white)

**Nền tảng chia sẻ và yêu cầu tài liệu giảng dạy, học tập chuyên biệt dành cho giáo viên và học sinh**

[Nội dung](#-mục-lục) • [Tính năng](#-tính-năng-chính) • [Cài đặt](#-hướng-dẫn-cài-đặt) • [Kiến trúc](#-kiến-trúc-hệ-thống) • [Sử dụng](#-hướng-dẫn-sử-dụng)

</div>

---

## 📋 Mục Lục

- [Giới thiệu](#-giới-thiệu)
- [Tính năng chính](#-tính-năng-chính)
- [Công nghệ sử dụng](#-công-nghệ-sử-dụng)
- [Hướng dẫn cài đặt](#-hướng-dẫn-cài-đặt)
- [Kiến trúc hệ thống](#-kiến-trúc-hệ-thống)
- [Cấu trúc thư mục](#-cấu-trúc-thư-mục)
- [Cơ sở dữ liệu](#-cơ-sở-dữ-liệu)
- [Hướng dẫn sử dụng](#-hướng-dẫn-sử-dụng)
- [Tài khoản mẫu](#-tài-khoản-mẫu)
- [API Reference](#-api-reference)
- [Troubleshooting](#-troubleshooting)
- [Đóng góp](#-đóng-góp)
- [License](#-license)

---

## 🌟 Giới thiệu

**EduDocs** là nền tảng web hiện đại được thiết kế đặc biệt cho cộng đồng giáo dục, giúp kết nối giáo viên và học sinh thông qua hệ thống chia sẻ tài liệu thông minh và dịch vụ yêu cầu tài liệu tùy chỉnh.

### 💡 Ý tưởng cốt lõi

Hệ thống giải quyết 3 nhu cầu chính:
1. **Kho tài liệu chung** - Nơi lưu trữ và chia sẻ tài liệu giáo dục công khai theo chủ đề
2. **Yêu cầu tài liệu riêng** - Dịch vụ đặt làm tài liệu tùy chỉnh theo nhu cầu cá nhân
3. **Cộng đồng trao đổi** - Không gian chat real-time để thảo luận và hỗ trợ

### 🎯 Đối tượng sử dụng

| Vai trò | Mô tả | Quyền hạn |
|---------|-------|-----------|
| **Admin** | Quản trị viên hệ thống | Quản lý toàn bộ tài liệu, yêu cầu, người dùng và chat |
| **Teacher** | Giáo viên | Tạo yêu cầu, tải tài liệu, tham gia chat |
| **Student** | Học sinh | Xem tài liệu public, tạo yêu cầu, chat |

---

## ✨ Tính năng chính

### 📚 Phân hệ Quản lý Tài liệu

#### Kho tài liệu chung
- ✅ Hiển thị danh mục tài liệu theo 4 chủ đề chính:
  - Bài 15: Thực vật cần gì để sống
  - Bài 16: Động vật cần gì để sống
  - Bài 17: Chăm sóc cây trồng vật nuôi
- ✅ Tải tài liệu công khai (PDF, Word, PowerPoint, Video)
- ✅ Xem trước tài liệu trực tiếp trên trình duyệt
- ✅ Lọc và tìm kiếm theo danh mục

#### Kho tài liệu cá nhân
- ✅ Tài liệu riêng tư chỉ hiển thị với người được chỉ định
- ✅ Bảo mật tuyệt đối - người khác không thể truy cập
- ✅ Quản lý tập trung trong "Tài liệu của tôi"

### 🎯 Phân hệ Yêu cầu Tài liệu

#### Form đặt yêu cầu (User)
```
├── Tiêu đề yêu cầu
├── Mô tả chi tiết
├── Lớp/Cấp học mục tiêu
├── Định dạng mong muốn (Video/File/PDF)
├── Hạn chót cần tài liệu
└── Ngân sách dự kiến (tùy chọn)
```

#### Quản lý yêu cầu (Admin)
- ✅ Giao diện quản lý trạng thái Kanban/Danh sách
- ✅ Các trạng thái: `Pending` → `Discussing` → `Processing` → `Completed/Rejected`
- ✅ Upload file kết quả và gắn với yêu cầu
- ✅ Xác nhận thanh toán thủ công

### 💬 Phân hệ Chat Real-time

#### Kênh Chat Tổng (Public)
- ✅ Phòng chat cộng đồng cho tất cả thành viên
- ✅ Admin có quyền xóa tin nhắn vi phạm
- ✅ Real-time message với Supabase Realtime

#### Kênh Chat Riêng (Private 1-1)
- ✅ Mỗi yêu cầu tự động tạo phòng chat riêng với Admin
- ✅ Tích hợp nút "Xem yêu cầu của tôi" trong khung chat
- ✅ Trao đổi và chốt chi phí thanh toán
- ✅ Lịch sử chat được lưu trữ

### 👤 Quản lý Người dùng & Thanh toán

- ✅ Đăng ký/Đăng nhập qua Email/Mật khẩu hoặc Google Auth
- ✅ Profile cá nhân với avatar và thông tin chi tiết
- ✅ Phân quyền rõ ràng: Admin, Teacher, Student
- ✅ Xác nhận thanh toán thủ công qua QR Code ngân hàng

---

## 🛠 Công nghệ sử dụng

### Frontend
| Công nghệ | Version | Mục đích |
|-----------|---------|----------|
| **Next.js** | 14.2.x | React Framework với App Router |
| **React** | 18.3.x | UI Library |
| **CSS3** | - | Styling với Custom Properties |

### Backend & Services
| Công nghệ | Mục đích |
|-----------|----------|
| **Supabase** | All-in-one Backend-as-a-Service |
| ├─ PostgreSQL | Cơ sở dữ liệu quan hệ |
| ├─ Auth | Xác thực và phân quyền |
| ├─ Realtime | Chat thời gian thực |
| └─ Storage | Lưu trữ file tài liệu |

### Thư viện chính
```json
{
  "@supabase/ssr": "^0.3.0",
  "@supabase/supabase-js": "^2.43.4",
  "next": "^14.2.4",
  "react": "18.3.1",
  "react-dom": "18.3.1"
}
```

### Tại sao chọn Stack này?

✅ **Không cần Backend độc lập** - Next.js Server Actions xử lý logic  
✅ **Supabase lo hết 4 việc lớn** - Database, Auth, Realtime, Storage  
✅ **Deploy đơn giản** - Chỉ cần deploy 1 dự án Next.js lên Vercel  
✅ **Bảo mật cao** - Row Level Security (RLS) của Supabase  
✅ **Real-time native** - Không cần cấu hình Socket.io phức tạp  

---

## 🚀 Hướng dẫn cài đặt

### Yêu cầu hệ thống

- **Node.js**: v18.17.0 trở lên (khuyến nghị v20.x)
- **npm**: v9.x trở lên
- **Supabase Account**: Miễn phí tại [supabase.com](https://supabase.com)

### Bước 1: Clone repository

```bash
git clone <repository-url>
cd trung-tam-tai-lieu
```

### Bước 2: Cài đặt dependencies

```bash
npm install
```

### Bước 3: Cấu hình Supabase

#### 3.1. Tạo project Supabase mới
1. Truy cập [supabase.com](https://supabase.com)
2. Đăng nhập và tạo project mới
3. Sao chép **Project URL** và **anon/public key**

#### 3.2. Tạo file biến môi trường

```bash
cp .env.example .env.local
```

#### 3.3. Điền thông tin vào `.env.local`

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-anon-key-here

# Optional: Service Role Key (chỉ dùng cho server-side admin operations)
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

> ⚠️ **Lưu ý bảo mật**: Không commit file `.env.local` lên Git!

### Bước 4: Thiết lập Database

#### 4.1. Chạy SQL Script

1. Truy cập **SQL Editor** trong Supabase Dashboard
2. Copy toàn bộ nội dung file `database.md`
3. Paste và chạy script để tạo:
   - Enum types
   - Tables
   - Indexes
   - Triggers
   - Row Level Security Policies
   - Seed data

#### 4.2. Kiểm tra sau khi chạy

```sql
-- Kiểm tra các bảng đã tạo
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public';

-- Kiểm tra categories đã có dữ liệu mẫu
SELECT * FROM categories;

-- Kiểm tra phòng chat tổng đã tạo
SELECT * FROM chat_rooms WHERE type = 'public';
```

### Bước 5: Cấu hình Storage Buckets

Trong Supabase Dashboard → **Storage**:

#### Tạo bucket `documents`
```
Name: documents
Public: false
File size limit: 50MB
Allowed MIME types: application/pdf, image/*, video/*, application/msword, 
                    application/vnd.openxmlformats-officedocument.*
```

#### Tạo bucket `avatars` (tùy chọn)
```
Name: avatars
Public: true
File size limit: 5MB
Allowed MIME types: image/*
```

### Bước 6: Chạy development server

```bash
npm run dev
```

Truy cập [http://localhost:3000](http://localhost:3000)

---

## 🏗 Kiến trúc hệ thống

### Tổng quan kiến trúc

```
┌─────────────────────────────────────────────────────────────┐
│                        Client Browser                        │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              Next.js Frontend (React)                 │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐   │   │
│  │  │   Pages     │  │ Components  │  │   Hooks     │   │   │
│  │  │  (App Router)│  │   (UI)      │  │  (Auth)     │   │   │
│  │  └─────────────┘  └─────────────┘  └─────────────┘   │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ HTTPS / REST API
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      Supabase Platform                       │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │ PostgreSQL  │  │    Auth     │  │  Realtime   │         │
│  │  Database   │  │  (JWT/OAuth)│  │  (WebSocket)│         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
│  ┌─────────────┐  ┌─────────────┐                          │
│  │  Storage    │  │    RLS      │                          │
│  │   (Files)   │  │  (Security) │                          │
│  └─────────────┘  └─────────────┘                          │
└─────────────────────────────────────────────────────────────┘
```

### Luồng xác thực (Authentication Flow)

```
┌──────────┐     ┌─────────────┐     ┌──────────────┐     ┌──────────┐
│  User    │────▶│  Login Page │────▶│  Supabase    │────▶│  Profile │
│          │     │             │     │    Auth      │     │  Create  │
└──────────┘     └─────────────┘     └──────────────┘     └──────────┘
                      │                     │                    │
                      │                     │                    │
                      ▼                     ▼                    ▼
                Email/Password        JWT Token            profiles Table
                                                              (Trigger)
```

### Luồng yêu cầu tài liệu (Request Flow)

```
User                         Admin                        System
 │                              │                            │
 ├─── Fill Request Form ──────▶ │                            │
 │                              │                            │
 │                              ├─── Review Request ───────▶ │
 │                              │                            │
 │◀── Auto Create Chat Room ────────────────────────────────│
 │                              │                            │
 ├─── Chat Discussion ─────────▶│                            │
 │◀─────────────────────────────│                            │
 │                              │                            │
 │                              ├─── Process Document ─────▶ │
 │                              │                            │
 │                              ├─── Upload Private Doc ───▶ │
 │                              │                            │
 │◀── Notification ─────────────────────────────────────────│
 │                              │                            │
 ├─── Download from             │                            │
 │    "Tài liệu của tôi" ──────▶│                            │
 │                              │                            │
```

---

## 📁 Cấu trúc thư mục

```
trung-tam-tai-lieu/
├── app/                          # Next.js App Router
│   ├── admin/                    # Phân hệ quản trị
│   │   ├── dashboard/            # Bảng điều khiển admin
│   │   ├── chat/                 # Quản lý chat
│   │   ├── quan-ly-danh-muc/     # CRUD categories
│   │   ├── quan-ly-nguoi-dung/   # Quản lý users & roles
│   │   ├── quan-ly-tai-lieu/     # Quản lý documents
│   │   │   ├── page.jsx          # Danh sách tài liệu
│   │   │   ├── them-moi/         # Thêm tài liệu mới
│   │   │   └── [id]/             # Chỉnh sửa tài liệu
│   │   └── quan-ly-yeu-cau/      # Quản lý requests
│   │       ├── page.jsx          # Danh sách yêu cầu
│   │       └── [id]/             # Chi tiết & xử lý yêu cầu
│   │
│   ├── auth/                     # Authentication routes
│   │   └── callback/             # OAuth callback handler
│   │
│   ├── chat-chung/               # Public chat room
│   ├── chat-rieng/               # Private chat rooms
│   │   └── [id]/                 # Room ID dynamic route
│   │
│   ├── dang-ky/                  # Registration page
│   ├── dang-nhap/                # Login page
│   ├── ho-so/                    # User profile
│   │
│   ├── kho-tai-lieu/             # Public document library
│   │   └── [id]/                 # Document detail view
│   │
│   ├── tai-lieu-cua-toi/         # Private documents
│   ├── yeu-cau/                  # Request system
│   │   ├── lich-su/              # Request history
│   │   └── [id]/                 # Request detail
│   │
│   ├── setup-admin/              # Setup admin account
│   ├── error.jsx                 # Error boundary
│   ├── loading.jsx               # Loading component
│   ├── not-found.jsx             # 404 page
│   ├── layout.jsx                # Root layout
│   ├── page.jsx                  # Homepage
│   └── globals.css               # Global styles
│
├── components/                   # Reusable React components
│   ├── HeaderNav.jsx             # Navigation header
│   └── ProtectedRoute.jsx        # Route protection HOC
│
├── lib/                          # Utility libraries
│   ├── auth-context.js           # Authentication context
│   └── supabase/
│       ├── client.js             # Supabase client (browser)
│       ├── server.js             # Supabase client (server)
│       └── middleware.js         # Supabase middleware utils
│
├── public/                       # Static assets
│
├── database.md                   # Database schema SQL
├── frontend-backend-mapping.md   # Integration blueprint
├── package.json                  # Dependencies & scripts
├── next.config.js                # Next.js configuration
├── jsconfig.json                 # JavaScript path aliases
└── README.md                     # This file
```

---

## 🗄 Cơ sở dữ liệu

### Sơ đồ ERD

```
┌─────────────────┐       ┌─────────────────┐
│    profiles     │       │   categories    │
├─────────────────┤       ├─────────────────┤
│ id (PK)         │       │ id (PK)         │
│ full_name       │       │ name            │
│ avatar_url      │       │ description     │
│ role (enum)     │       │ created_at      │
│ created_at      │       └────────┬────────┘
│ updated_at      │                │
└────────┬────────┘                │
         │                         │
         │                         │
         ▼                         ▼
┌─────────────────┐       ┌─────────────────┐
│   documents     │       │document_requests│
├─────────────────┤       ├─────────────────┤
│ id (PK)         │       │ id (PK)         │
│ title           │       │ user_id (FK)    │
│ description     │       │ title           │
│ file_path       │       │ description     │
│ preview_file    │       │ target_level    │
│ category_id(FK) │       │ format_needed   │
│ is_public       │       │ deadline        │
│ owner_id (FK)   │       │ budget          │
│ created_by (FK) │       │ status (enum)   │
│ created_at      │       │ is_paid         │
│ updated_at      │       │fulfilled_doc(FK)│
└─────────────────┘       │ created_at      │
                          │ updated_at      │
                          └────────┬────────┘
                                   │
                                   │
                          ┌────────▼────────┐
                          │   chat_rooms    │
                          ├─────────────────┤
                          │ id (PK)         │
                          │ type (enum)     │
                          │ request_id (FK) │
                          │ user_id (FK)    │
                          │ created_at      │
                          └────────┬────────┘
                                   │
                                   │
                          ┌────────▼────────┐
                          │ chat_messages   │
                          ├─────────────────┤
                          │ id (PK)         │
                          │ room_id (FK)    │
                          │ sender_id (FK)  │
                          │ content         │
                          │ created_at      │
                          └─────────────────┘
```

### Các bảng chính

#### 1. `profiles` - Thông tin người dùng
Mở rộng từ `auth.users` của Supabase.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key, references auth.users |
| full_name | TEXT | Tên đầy đủ |
| avatar_url | TEXT | URL avatar |
| role | ENUM | 'admin', 'teacher', 'student' |
| created_at | TIMESTAMPTZ | Thời gian tạo |
| updated_at | TIMESTAMPTZ | Thời gian cập nhật |

#### 2. `documents` - Tài liệu
Chứa cả public và private documents.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| title | TEXT | Tiêu đề tài liệu |
| file_path | TEXT | Đường dẫn file gốc trong Storage |
| preview_file_path | TEXT | File xem trước (PDF) |
| is_public | BOOLEAN | Public hay private |
| owner_id | UUID | Chủ sở hữu (cho private docs) |
| category_id | UUID | Danh mục |

#### 3. `document_requests` - Yêu cầu tài liệu

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| user_id | UUID | Người yêu cầu |
| title | TEXT | Tiêu đề yêu cầu |
| status | ENUM | pending, discussing, processing, completed, rejected |
| fulfilled_document_id | UUID | Tài liệu hoàn thành |
| is_paid | BOOLEAN | Đã thanh toán |

#### 4. `chat_rooms` & `chat_messages` - Hệ thống chat

| chat_rooms | chat_messages |
|------------|---------------|
| id (PK) | id (PK) |
| type (public/private) | room_id (FK) |
| request_id (FK) | sender_id (FK) |
| user_id (FK) | content (TEXT) |
| created_at | created_at |

### Row Level Security (RLS)

Hệ thống sử dụng RLS để bảo mật dữ liệu ở cấp độ dòng:

```sql
-- Documents: Public thì ai cũng xem, Private chỉ owner và admin
CREATE POLICY "Public documents viewable by everyone" 
ON documents FOR SELECT USING (is_public = true);

CREATE POLICY "Private documents viewable by owner or admin" 
ON documents FOR SELECT USING (
  (is_public = false AND owner_id = auth.uid()) OR
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Requests: User xem của mình, admin xem tất cả
CREATE POLICY "Users can view own requests" 
ON document_requests FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admin can view all requests" 
ON document_requests FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
```

---

## 📖 Hướng dẫn sử dụng

### Cho Người dùng (Học sinh/Giáo viên)

#### 1. Đăng ký & Đăng nhập

1. Truy cập `/dang-ky` để tạo tài khoản mới
2. Nhập email, mật khẩu và họ tên
3. Sau khi đăng ký, tự động đăng nhập
4. Lần sau đăng nhập tại `/dang-nhap`

#### 2. Xem và tải tài liệu

1. Vào **Kho tài liệu** (`/kho-tai-lieu`)
2. Chọn danh mục hoặc tìm kiếm tài liệu
3. Click vào tài liệu để xem chi tiết
4. Xem trước trong iframe hoặc tải về máy

#### 3. Tạo yêu cầu tài liệu

1. Vào **Yêu cầu tài liệu** (`/yeu-cau`)
2. Điền form với thông tin chi tiết:
   - Tiêu đề ngắn gọn
   - Mô tả cụ thể những gì cần
   - Cấp học/lớp
   - Định dạng mong muốn
   - Thời hạn (nếu có)
3. Submit và chờ Admin phản hồi

#### 4. Theo dõi yêu cầu

1. Vào **Lịch sử yêu cầu** (`/yeu-cau/lich-su`)
2. Xem trạng thái từng yêu cầu
3. Khi hoàn thành, tải file từ "Tài liệu của tôi"

#### 5. Chat với Admin

1. Tự động có phòng chat riêng khi tạo yêu cầu
2. Hoặc vào **Chat riêng** để trò chuyện
3. Thảo luận chi tiết về yêu cầu và thanh toán

#### 6. Tham gia cộng đồng

1. Vào **Cộng đồng** (`/chat-chung`)
2. Giao lưu, hỏi bài, chia sẻ kinh nghiệm
3. Tôn trọng nội quy cộng đồng

### Cho Quản trị viên (Admin)

#### 1. Truy cập Admin Dashboard

1. Đăng nhập bằng tài khoản admin
2. Click vào menu **⚙️ Admin**
3. Truy cập các chức năng quản lý

#### 2. Quản lý danh mục

- Thêm, sửa, xóa các chủ đề bài học
- Phân loại tài liệu theo danh mục

#### 3. Quản lý tài liệu

**Thêm tài liệu mới:**
1. Vào **Quản lý tài liệu** → **Thêm mới**
2. Upload file gốc (Word, PPT, PDF, Video)
3. Nếu là Word/PPT, upload thêm bản PDF xem trước
4. Điền thông tin: tiêu đề, mô tả, danh mục
5. Chọn chế độ: Public hoặc Private
6. Nếu Private, chọn chủ sở hữu (owner)

**Chỉnh sửa tài liệu:**
- Click vào tài liệu trong danh sách
- Cập nhật thông tin hoặc thay thế file

#### 4. Quản lý yêu cầu

1. Vào **Quản lý yêu cầu**
2. Xem danh sách yêu cầu theo trạng thái
3. Click vào yêu cầu để chi tiết
4. Các thao tác:
   - Duyệt/Từ chối yêu cầu
   - Cập nhật trạng thái
   - Chat với người yêu cầu
   - Upload tài liệu hoàn thành
   - Xác nhận đã thanh toán

#### 5. Quản lý người dùng

- Xem danh sách tất cả users
- Cấp/quyết quyền (student → teacher → admin)
- Xem thông tin chi tiết

#### 6. Quản lý chat

- Giám sát phòng chat tổng
- Xóa tin nhắn vi phạm
- Tham gia chat riêng với users

---

## 🔑 Tài khoản mẫu

Hệ thống cung cấp sẵn các tài khoản test:

### Admin Account
```
Email: admin@edudocs.vn
Mật khẩu: Admin@123456
Vai trò: Administrator
```

### User Account
```
Email: oosp0305@gmail.com
Mật khẩu: 123456
Vai trò: Student
```

> ⚠️ **Lưu ý**: Đổi mật khẩu ngay sau khi đăng nhập lần đầu trong môi trường production!

---

## 📡 API Reference

### Supabase Client Usage

#### Khởi tạo Client

```javascript
// Client-side (React components)
import { createClient } from '@/lib/supabase/client'
const supabase = createClient()

// Server-side (Server Components, Server Actions)
import { createClient as createServerClient } from '@/lib/supabase/server'
const supabase = await createServerClient()
```

#### Authentication

```javascript
// Đăng nhập
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password123'
})

// Đăng ký
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'password123',
  options: {
    data: {
      full_name: 'Nguyen Van A'
    }
  }
})

// Đăng xuất
await supabase.auth.signOut()

// Lấy user hiện tại
const { data: { session } } = await supabase.auth.getSession()
```

#### Fetch Documents

```javascript
// Lấy tài liệu public
const { data: documents } = await supabase
  .from('documents')
  .select('*, categories(name)')
  .eq('is_public', true)
  .order('created_at', { ascending: false })

// Lấy tài liệu private của user
const { data: myDocs } = await supabase
  .from('documents')
  .select('*')
  .eq('is_public', false)
  .eq('owner_id', userId)

// Get file URL
const { data: { signedUrl } } = await supabase.storage
  .from('documents')
  .createSignedUrl(filePath, 3600) // 1 hour expiry
```

#### Create Request

```javascript
const { data, error } = await supabase
  .from('document_requests')
  .insert({
    user_id: userId,
    title: 'Cần tài liệu bài 15',
    description: 'Mô tả chi tiết...',
    target_level: 'Lớp 4',
    format_needed: 'PDF',
    deadline: '2024-12-31',
    budget: '100000'
  })
```

#### Realtime Chat

```javascript
// Subscribe to chat messages
const channel = supabase
  .channel(`chat:${roomId}`)
  .on('postgres_changes', 
    { 
      event: 'INSERT', 
      schema: 'public', 
      table: 'chat_messages',
      filter: `room_id=eq.${roomId}`
    }, 
    (payload) => {
      console.log('New message:', payload.new)
    }
  )
  .subscribe()

// Send message
await supabase.from('chat_messages').insert({
  room_id: roomId,
  sender_id: userId,
  content: 'Hello!'
})

// Unsubscribe
supabase.removeChannel(channel)
```

---

## 🔧 Troubleshooting

### Lỗi thường gặp

#### 1. "Invalid API key"

**Nguyên nhân**: Sai SUPABASE_PUBLISHABLE_KEY trong `.env.local`

**Giải pháp**:
- Kiểm tra lại key trong Supabase Dashboard → Settings → API
- Restart dev server sau khi đổi env

#### 2. "Row Level Security policy violation"

**Nguyên nhân**: User cố truy cập dữ liệu không có quyền

**Giải pháp**:
- Kiểm tra RLS policies trong database.md
- Đảm bảo user đã đăng nhập
- Verify role trong bảng profiles

#### 3. "File upload failed"

**Nguyên nhân**: Storage bucket chưa tạo hoặc thiếu permission

**Giải pháp**:
```sql
-- Tạo storage bucket nếu chưa có
INSERT INTO storage.buckets (id, name, public) 
VALUES ('documents', 'documents', false);

-- Tạo policy cho bucket
CREATE POLICY "Users can upload documents"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'documents');
```

#### 4. "Hydration mismatch"

**Nguyên nhân**: State giữa server và client không khớp

**Giải pháp**:
- Đảm bảo AuthProvider khởi tạo state giống server
- Sử dụng `useEffect` cho client-only logic
- Tránh render conditional dựa trên window object

#### 5. Chat không real-time

**Nguyên nhân**: Supabase Realtime chưa enabled

**Giải pháp**:
1. Vào Supabase Dashboard → Database → Replication
2. Enable replication cho bảng `chat_messages`
3. Check console log subscription status

### Debug Tips

```javascript
// Enable Supabase debug logging
const supabase = createClient(url, key, {
  debug: true
})

// Check auth state
const { data: { session } } = await supabase.auth.getSession()
console.log('Session:', session)

// Check user role
const { data: profile } = await supabase
  .from('profiles')
  .select('role')
  .eq('id', userId)
  .single()
console.log('Role:', profile?.role)
```

---

## 🤝 Đóng góp

Chúng tôi chào đón mọi đóng góp từ cộng đồng!

### Cách đóng góp

1. **Fork** repository này
2. Tạo branch tính năng: `git checkout -b feature/amazing-feature`
3. Commit thay đổi: `git commit -m 'Add amazing feature'`
4. Push lên branch: `git push origin feature/amazing-feature`
5. Mở **Pull Request**

### Quy tắc code

- Sử dụng JavaScript ES6+
- Tuân thủ cấu trúc thư mục hiện tại
- Comment code phức tạp
- Test kỹ trước khi submit PR

### Báo cáo lỗi

Sử dụng GitHub Issues để báo lỗi:
- Mô tả rõ ràng vấn đề
- Các bước reproduce
- Kết quả mong đợi vs thực tế
- Screenshot (nếu có)

---

## 📄 License

Dự án này được phát hành dưới giấy phép MIT License.

```
Copyright (c) 2024 EduDocs Team

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.
```

---

## 📞 Liên hệ

- **Website**: [[Your Website](https://ebookdocs.vercel.app/)]
- **Email**: support@edudocs.vn
- **Documentation**: `/docs` folder

---

<div align="center">

**Made with ❤️ for Education**

[⬆ Back to Top](#-trung-tâm-tài-liệu-giáo-dục---edudocs)

</div>
