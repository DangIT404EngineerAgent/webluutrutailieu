## **I. KIẾN TRÚC TÍNH NĂNG CHI TIẾT (FUNCTIONAL SPECIFICATION)**

Hệ thống sẽ chia làm 3 phân hệ chính dựa trên vai trò người dùng: **Admin**, **Giáo viên**, và **Học sinh** (Giáo viên và học sinh gọi chung là Người dùng công cộng, nhưng có thể phân quyền tải tài liệu nâng cao cho giáo viên).

### **1\. Phân hệ Quản lý Tài liệu (Core Module)**

* **Kho tài liệu chung:** Hiển thị danh mục tài liệu của khoa học 4 chủ đề thực vật động vật (Bài 15 Thực vật cần gì để sống, Bài 16 Động vật cần gì để sống,Bài 17 Chăm sóc cây trồng vật nuôi).  
* **Tải tài liệu công khai:** Admin đăng lên $\\rightarrow$ Tất cả mọi người (hoặc user đã đăng nhập) đều thấy và tải được.  
* **Kho tài liệu cá nhân (Yêu cầu riêng):** Nơi chứa các tài liệu mà Admin tải lên *chỉ dành riêng cho người yêu cầu*. Người khác truy cập sẽ không thấy.

### **2\. Phân hệ Yêu cầu Tài liệu (Request System) \- *Tính năng cốt lõi của bạn***

* **Form đặt yêu cầu (User):** Gồm các trường thông tin: *Tiêu đề, Mô tả chi tiết, Lớp/Cấp học, Định dạng mong muốn (Video/File), Hạn chót cần tài liệu, Ngân sách dự kiến (nếu có).*  
* **Trình quản lý yêu cầu (Admin):** Giao diện Kanban hoặc Danh sách kiểm duyệt:  
  * *Trạng thái:* Chờ duyệt $\\rightarrow$ Đang thảo luận $\\rightarrow$ Đang xử lý $\\rightarrow$ Đã hoàn thành / Từ chối.  
* **Trả kết quả riêng tư:** Khi Admin bấm "Hoàn thành", hệ thống cho phép upload file đính kèm và gắn ID của file đó duy nhất với ID của người yêu cầu.

### **3\. Phân hệ Chat Real-time (Hệ thống Trò chuyện)**

* **Kênh Chat Tổng (Public Chat):** Nơi tất cả học sinh, giáo viên vào giao lưu, hỏi bài, chia sẻ kinh nghiệm. Admin có quyền xóa tin nhắn vi phạm.  
* **Kênh Chat Riêng (Private Chat với Admin):**  
  * Mỗi user khi bấm vào "Chat với Admin" sẽ mở ra một phòng chat riêng biệt (1-1).  
  * Tích hợp nút **"Xem yêu cầu của tôi"** ngay trong khung chat để Admin và User tiện vừa chat vừa check xem đang bàn về đơn hàng/tài liệu nào.  
  * Trao đổi và chốt chi phí thanh toán tại đây.

### **4\. Quản lý Người dùng & Thanh toán (User & Payment Management)**

* **Đăng ký/Đăng nhập:** Qua Email/Mật khẩu hoặc Google Auth cho nhanh gọn.  
* **Xác nhận thanh toán thủ công:** Vì bạn muốn tự bàn bạc qua chat, nên Admin sẽ có một nút "Xác nhận đã thanh toán" trong quản lý user hoặc quản lý request để kích hoạt quyền tải file cho user sau khi nhận được chuyển khoản ngân hàng (quét mã QR).

## **II. ĐỀ XUẤT NỀN TẢNG CÔNG NGHỆ (TECH STACK)**

Để hệ thống chạy mượt mà, bảo mật file tốt (không cho người khác copy link tải trộm) và chi phí phát triển hợp lý, đây là bộ công nghệ tối ưu:  
Next.js \+ Supabase: **Không cần viết Backend độc lập:** Next.js có sẵn **Server Actions** để bạn viết code xử lý logic ngay trong dự án Frontend.  
**Supabase lo hết 4 việc lớn:** Thay vì dùng 4 dịch vụ, Supabase sẽ cân trọn: Database (Postgres), Auth (Đăng nhập/Phân quyền), Real-time (Chat nhảy ngay lập tức không cần cài Socket.io), và Storage (Lưu file tài liệu, hỗ trợ sẵn link bảo mật có thời hạn giống Cloudflare R2).  
**Không lo lỗi kết nối:** Bạn chỉ deploy duy nhất 1 dự án Next.js lên Vercel là xong, không lo cấu hình CORS nhức đầu.  
III. QUY TRÌNH VẬN HÀNH TRÊN ỨNG DỤNG (USER WORKFLOW)  
**Bước 1:** Giáo viên cần tài liệu A $\\rightarrow$ Điền Form yêu cầu trên Web.  
**Bước 2:** Hệ thống thông báo cho Admin \+ Tự động mở một phòng chat riêng giữa Admin và Giáo viên đó (gắn kèm mã yêu cầu).  
**Bước 3:** Hai bên chat thương lượng chi phí $\\rightarrow$ Giáo viên chuyển khoản ngân hàng qua ảnh QR $\\rightarrow$ Admin bấm "Xác nhận đã thanh toán".  
**Bước 4:** Admin tìm/làm tài liệu $\\rightarrow$ Upload lên hệ thống dưới dạng "Tài liệu riêng tư" cho Giáo viên đó.  
**Bước 5:** Giáo viên vào mục "Tài liệu của tôi" để tải về (Mọi định dạng: Word, PDF, Video...). Học sinh khác vào web sẽ hoàn toàn không thấy file này.