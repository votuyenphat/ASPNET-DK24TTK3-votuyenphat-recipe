# ASPNET-DK24TTK3-votuyenphat-recipe
## Đề tài: Trang web chia sẻ công thức nấu ăn trực tuyến (Cookpad Clone)

---

### 1. THÔNG TIN SINH VIÊN
* **Họ và tên:** [Võ Tuyến Phát ]
* **Mã lớp:** [DK24TTK3]
* [cite_start]**Tên Repository:** ASPNET-[DK24TTK3]-[votuyenphat]-recipe [cite: 65]
* [cite_start]**Email liên lạc:** [vphat772@gmail.com] [cite: 95]
* [cite_start]**Số điện thoại:** [0908428523] [cite: 95]

---

### 2. GIỚI THIỆU ĐỒ ÁN
* [cite_start]**Mục tiêu:** Xây dựng ứng dụng web cho phép người dùng đăng tải, tìm kiếm và quản lý công thức nấu ăn[cite: 19].
* **Công nghệ sử dụng:**
    * [cite_start]**Backend:** ASP.NET Core Web API[cite: 21].
    * [cite_start]**Frontend:** React.js[cite: 21].
    * [cite_start]**Cơ sở dữ liệu:** SQL Server[cite: 21].
* **Trạng thái:** Đang thực hiện.

---

### [cite_start]3. CẤU TRÚC THƯ MỤC REPOSITORY [cite: 78]
Dự án được tổ chức theo quy định bắt buộc của tài liệu hướng dẫn:

* [cite_start]**`/setup`**: Chứa tập tin cài đặt chương trình, SQL script khởi tạo dữ liệu[cite: 80].
* [cite_start]**`/scr`**: Chứa toàn bộ mã nguồn chương trình (Backend API & Frontend React)[cite: 82].
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
* **Chi tiết cấu hình**: Xem chi tiết tại thư mục [setup/README.md](file:///d:/lam-muon/cook-pad/ASPNET-DK24TTK3-votuyenphat-recipe/setup/README.md).

---

## Các Module Đã Thực Hiện

### Authentication Module
* Xây dựng API cho chức năng Login
* Tích hợp ASP.NET Identity
* Xử lý xác thực bằng Email + Password
* Sinh JWT Token cho người dùng sau khi đăng nhập thành công