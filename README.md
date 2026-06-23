# ASPNET-DK24TTK3-votuyenphat-recipe
## Đề tài: Trang web chia sẻ công thức nấu ăn trực tuyến (Cookpad Clone)

---

### 1. THÔNG TIN SINH VIÊN
* **Họ và tên:** [Võ Tuyến Phát ]
* **Mã lớp:** [DK24TTK3]
* **Tên Repository:** ASPNET-[DK24TTK3]-[votuyenphat]-recipe
* **Email liên lạc:** [vphat772@gmail.com]
* **Số điện thoại:** [0908428523]

---

### 2. GIỚI THIỆU ĐỒ ÁN
* **Mục tiêu:** Xây dựng ứng dụng web cho phép người dùng đăng tải, tìm kiếm và quản lý công thức nấu ăn.
* **Công nghệ sử dụng:**
    * **Backend:** ASP.NET Core Web API.
    * **Frontend:** React.js.
    * **Cơ sở dữ liệu:** SQL Server.
* **Trạng thái:** Đang thực hiện.

---

### 3. CẤU TRÚC THƯ MỤC REPOSITORY
Dự án được tổ chức theo quy định bắt buộc của tài liệu hướng dẫn:

* **`/setup`**: Chứa tập tin cài đặt chương trình, SQL script khởi tạo dữ liệu.
* **`/scr`**: Chứa toàn bộ mã nguồn chương trình (Backend API & Frontend React).
* **`/progress-report`**: [Bắt buộc] Chứa các file báo cáo tiến độ hàng tuần (.pdf/.docx).
* **`/thesis`**: [Bắt buộc] Tài liệu văn bản của đồ án:
    * `/doc`: Chứa tài liệu định dạng .DOC.
    * `/pdf`: Chứa tài liệu định dạng .PDF.
    * `/refs`: Chứa các tài liệu tham khảo khi thực hiện đồ án.
    * `/abs`: Chứa slide báo cáo (.PPT), video demo (.AVI).

---

### 4. HƯỚNG DẪN KHỞI CHẠY (QUICK START)

Dự án đã được cấu hình Docker đầy đủ. Bạn chỉ cần thực hiện lệnh sau tại thư mục gốc để khởi chạy toàn bộ hệ thống (Database, API Backend và Frontend):

```bash
docker compose up --build
```

* **Frontend**: [http://localhost:5173](http://localhost:5173)
* **Backend API (Swagger)**: [http://localhost:5242/swagger](http://localhost:5242/swagger)
* **Chi tiết cấu hình**: Xem chi tiết tại thư mục [setup/README.md]

---

## Các Module Đã Thực Hiện

### 1. Authentication Module (Xác thực người dùng)
* Tích hợp **ASP.NET Core Identity** để quản lý người dùng và vai trò (Roles).
* Đăng ký tài khoản mới và đăng nhập an toàn bằng Email/Mật khẩu.
* Cơ chế xác thực phi tập trung sử dụng **JWT (JSON Web Token)**.
* Bảo mật mã hóa mật khẩu, quản lý phiên và phân quyền truy cập các API (Authorize).

### 2. Recipe Management (Quản lý công thức)
* Đăng tải công thức nấu ăn mới bao gồm: Tiêu đề, mô tả ngắn, hình ảnh đại diện, danh sách nguyên liệu và các bước thực hiện chi tiết.
* Hỗ trợ cập nhật chỉnh sửa và xóa công thức (ràng buộc quyền sở hữu: chỉ tác giả hoặc Quản trị viên mới được thao tác).
* Hiển thị chi tiết công thức nấu ăn với định dạng trực quan.

### 3. Categories & Tags (Danh mục & Nhãn dán)
* Phân loại công thức theo các danh mục lớn (Món Khai Vị, Món Kho, Món Canh, Món Xào, Bánh & Đồ Ngọt...).
* Đính kèm nhãn dán (Tags) như: Món Ngon Mỗi Ngày, Ăn Sáng, Giảm Cân, Dễ Làm... để tăng tính liên kết.
* Tự động khởi tạo dữ liệu mẫu (Seeding) danh mục và nhãn dán khi khởi chạy hệ thống lần đầu.

### 4. Search & Discovery (Tìm kiếm & Bộ lọc)
* Tìm kiếm công thức thông minh theo từ khóa (tiêu đề, mô tả).
* Lọc các công thức nấu ăn theo Danh mục (Categories) và Nhãn dán (Tags).
* Gợi ý món ngon ngẫu nhiên hoặc phổ biến tại trang chủ.

### 5. User Profile (Hồ sơ người dùng)
* Trang cá nhân hiển thị chi tiết thông tin của user và danh sách các công thức họ đã đăng tải.
* Cho phép chỉnh sửa thông tin cá nhân: Cập nhật Tên hiển thị, Tiểu sử và Ảnh đại diện (Avatar).
* Hỗ trợ xem hồ sơ công khai của các đầu bếp/người dùng khác trên hệ thống.

### 6. Interactions (Tương tác & Cộng đồng)
* Yêu thích/Thích (Like) các công thức nấu ăn.
* Bình luận (Comment) đóng góp ý kiến, phản hồi dưới mỗi công thức.

### 7. Upload Service (Tải lên hình ảnh)
* API xử lý lưu trữ hình ảnh tải lên cho Avatar người dùng và hình ảnh minh họa cho món ăn.
* Lưu trữ cục bộ an toàn và cấu hình Static Files phục vụ ảnh trực tiếp qua URL.

### 8. Admin Dashboard (Trang quản trị)
* Giao diện dành riêng cho Admin quản lý danh sách người dùng và các bài đăng công thức.
* Kiểm duyệt nội dung, xóa bỏ các bài đăng vi phạm chính sách cộng đồng.
