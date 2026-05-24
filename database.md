-- ========================================================================================
-- 1. THIẾT LẬP ENUM TYPES (Các kiểu dữ liệu cố định)
-- ========================================================================================
CREATE TYPE user_role AS ENUM ('admin', 'teacher', 'student');
CREATE TYPE request_status AS ENUM ('pending', 'discussing', 'processing', 'completed', 'rejected');
CREATE TYPE room_type AS ENUM ('public', 'private');

-- ========================================================================================
-- 2. TẠO CÁC BẢNG (TABLES)
-- ========================================================================================

-- Bảng Profiles: Mở rộng từ bảng auth.users mặc định của Supabase
CREATE TABLE profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    full_name TEXT,
    avatar_url TEXT,
    role user_role DEFAULT 'student' NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bảng Danh mục / Chủ đề bài học
CREATE TABLE categories (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bảng Tài liệu (Chứa cả Public và Private)
CREATE TABLE documents (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    file_path TEXT NOT NULL, -- Đường dẫn file gốc trong Supabase Storage
    file_format TEXT NOT NULL, -- Định dạng file (pdf, video, word, powerpoint)
    preview_file_path TEXT, -- Đường dẫn file dùng để xem trước (VD: file PDF của bản Word/PPT để render trên web)
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    is_public BOOLEAN DEFAULT true, -- Nếu false là tài liệu riêng tư
    owner_id UUID REFERENCES profiles(id) ON DELETE SET NULL, -- Chỉ định ai sở hữu file riêng tư
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL, -- Thường là admin upload
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bảng Yêu cầu tài liệu (Request System)
CREATE TABLE document_requests (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL, -- Người yêu cầu
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    target_level TEXT, -- Lớp/Cấp học
    format_needed TEXT, -- Định dạng mong muốn
    deadline TIMESTAMPTZ,
    budget TEXT,
    status request_status DEFAULT 'pending',
    is_paid BOOLEAN DEFAULT false, -- Đã thanh toán hay chưa
    fulfilled_document_id UUID REFERENCES documents(id) ON DELETE SET NULL, -- File tài liệu trả về khi hoàn thành
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bảng Phòng Chat
CREATE TABLE chat_rooms (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    type room_type DEFAULT 'private',
    name TEXT, -- Tên phòng (VD: Chat tổng)
    request_id UUID REFERENCES document_requests(id) ON DELETE CASCADE, -- Gắn với một request nếu là private 1-1
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE, -- Người tạo phòng chat private
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bảng Tin nhắn (Real-time)
CREATE TABLE chat_messages (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    room_id UUID REFERENCES chat_rooms(id) ON DELETE CASCADE NOT NULL,
    sender_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========================================================================================
-- 3. CHỈ MỤC TỐI ƯU (INDEXES) ĐỂ TRUY VẤN NHANH
-- ========================================================================================
CREATE INDEX idx_documents_is_public ON documents(is_public);
CREATE INDEX idx_documents_owner_id ON documents(owner_id);
CREATE INDEX idx_requests_user_id ON document_requests(user_id);
CREATE INDEX idx_chat_messages_room_id ON chat_messages(room_id);
CREATE INDEX idx_chat_rooms_request_id ON chat_rooms(request_id);

-- ========================================================================================
-- 4. TRIGGERS: TỰ ĐỘNG CẬP NHẬT `updated_at` & TẠO PROFILE
-- ========================================================================================

-- Hàm cập nhật timestamp
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Gắn trigger cho các bảng
CREATE TRIGGER update_profiles_modtime BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_modified_column();
CREATE TRIGGER update_documents_modtime BEFORE UPDATE ON documents FOR EACH ROW EXECUTE FUNCTION update_modified_column();
CREATE TRIGGER update_requests_modtime BEFORE UPDATE ON document_requests FOR EACH ROW EXECUTE FUNCTION update_modified_column();

-- Hàm tự tạo profile khi User Đăng ký qua Supabase Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url, role)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url', 'student');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- ========================================================================================
-- 5. BẢO MẬT DỮ LIỆU DÒNG (ROW LEVEL SECURITY - RLS)
-- ========================================================================================

-- Kích hoạt RLS trên tất cả các bảng
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- 5.1. PROFILES: Ai cũng xem được profile, nhưng chỉ chính chủ/admin mới được sửa
CREATE POLICY "Public profiles are viewable by everyone." ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile." ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile." ON profiles FOR UPDATE USING (auth.uid() = id);

-- 5.2. CATEGORIES: Ai cũng xem được, chỉ Admin được thêm/sửa/xoá
CREATE POLICY "Categories are viewable by everyone" ON categories FOR SELECT USING (true);
CREATE POLICY "Only admin can manage categories" ON categories FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- 5.3. DOCUMENTS: Tài liệu Public thì ai cũng thấy. Tài liệu Private chỉ Admin và Chủ sở hữu thấy
CREATE POLICY "Public documents viewable by everyone" ON documents FOR SELECT USING (is_public = true);
CREATE POLICY "Private documents viewable by owner or admin" ON documents FOR SELECT USING (
  (is_public = false AND owner_id = auth.uid()) OR
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Only admin can manage documents" ON documents FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- 5.4. DOCUMENT REQUESTS: User xem/tạo/sửa yêu cầu của mình. Admin quản lý toàn bộ.
CREATE POLICY "Users can view own requests" ON document_requests FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admin can view all requests" ON document_requests FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Users can create requests" ON document_requests FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own requests" ON document_requests FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Admin can manage all requests" ON document_requests FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- 5.5. CHAT ROOMS: Phòng Public ai cũng thấy. Phòng Private chỉ User đó và Admin thấy.
CREATE POLICY "Public rooms viewable by everyone" ON chat_rooms FOR SELECT USING (type = 'public');
CREATE POLICY "Private rooms viewable by owner or admin" ON chat_rooms FOR SELECT USING (
  (type = 'private' AND user_id = auth.uid()) OR
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Users can create private rooms" ON chat_rooms FOR INSERT WITH CHECK (auth.uid() = user_id AND type = 'private');
CREATE POLICY "Admin can manage rooms" ON chat_rooms FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- 5.6. CHAT MESSAGES: Ai vào được phòng chat nào thì xem/gửi tin nhắn ở phòng đó
CREATE POLICY "View messages in accessible rooms" ON chat_messages FOR SELECT USING (
  EXISTS (SELECT 1 FROM chat_rooms WHERE id = chat_messages.room_id)
);
CREATE POLICY "Insert message in accessible rooms" ON chat_messages FOR INSERT WITH CHECK (
  auth.uid() = sender_id AND
  EXISTS (SELECT 1 FROM chat_rooms WHERE id = chat_messages.room_id)
);

-- Cho phép Admin xoá tin nhắn vi phạm
CREATE POLICY "Admin can delete any message" ON chat_messages FOR DELETE USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- ========================================================================================
-- 6. TẠO DỮ LIỆU MẪU BAN ĐẦU (SEED DATA)
-- ========================================================================================
INSERT INTO categories (name, description) VALUES 
('Thực vật cần gì để sống', 'Bài 15'),
('Động vật cần gì để sống', 'Bài 16'),
('Chăm sóc cây trồng vật nuôi', 'Bài 17');

-- Tạo sẵn 1 phòng Chat Tổng Public
INSERT INTO chat_rooms (type, name) VALUES ('public', 'Kênh Chat Tổng');
