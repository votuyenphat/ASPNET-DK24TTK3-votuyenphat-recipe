# Hướng Dẫn Cài Đặt (Setup Guide)

Tài liệu này hướng dẫn cách khởi chạy và thiết lập ứng dụng Chia sẻ công thức nấu ăn trực tuyến (Cookpad Clone) bằng hai cách: sử dụng **Docker Compose** (khuyên dùng) hoặc cài đặt **Thủ công (Manual)** trên máy cục bộ.

---

## ⚡ Cách 1: Triển khai nhanh bằng Docker (Khuyên dùng)

Với Docker, bạn không cần cài đặt SQL Server, Node.js hay .NET SDK trên máy thật. Chỉ cần cài sẵn Docker Desktop trên máy của bạn.

### Các bước thực hiện:

1. **Khởi chạy các container:**
   Mở terminal tại thư mục gốc của dự án (nơi chứa file `docker-compose.yml`) và chạy lệnh sau:
   ```bash
   docker compose up --build
   ```

2. **Hệ thống sẽ tự động thực hiện:**
   - Tạo container Database chạy **SQL Server 2022**.
   - Tạo container Backend: Cài đặt các gói NuGet và khởi chạy **ASP.NET Core Web API**.
   - Chạy lệnh Database Migration để tự động cấu hình bảng và các trường dữ liệu mẫu (Categories, Tags) vào SQL Server.
   - Tạo container Frontend: Cài đặt các thư viện npm và chạy **Vite React Dev Server**.

3. **Địa chỉ truy cập:**
   - **Frontend (Giao diện người dùng)**: [http://localhost:5173](http://localhost:5173)
   - **Backend API (Swagger UI)**: [http://localhost:5242/swagger](http://localhost:5242/swagger)
   - **Cơ sở dữ liệu (SQL Server)**: `localhost,1433` (Tài khoản: `sa` / Mật khẩu: `YourStrong@Password123`)

---

## 🛠️ Cách 2: Cài đặt thủ công (Không dùng Docker)

Nếu muốn chạy trực tiếp trên máy cục bộ mà không sử dụng Docker, bạn cần chuẩn bị sẵn:
- **.NET SDK 8.0**
- **Node.js LTS (phiên bản 18 trở lên)**
- **SQL Server Local hoặc Express**

### 1. Thiết lập Database (SQL Server)
- Tạo mới cơ sở dữ liệu có tên là `RecipeAppDb` trên SQL Server của bạn.
- Cấu hình lại chuỗi kết nối trong file [appsettings.json](file:///d:/lam-muon/cook-pad/ASPNET-DK24TTK3-votuyenphat-recipe/src/backend/RecipeApp.API/appsettings.json) cho phù hợp với SQL Server trên máy bạn.

### 2. Khởi động Backend API
1. Mở terminal tại thư mục `src/backend/RecipeApp.API`.
2. Khởi tạo cơ sở dữ liệu bằng cách chạy lệnh migration:
   ```bash
   dotnet ef database update
   ```
3. Chạy ứng dụng API:
   ```bash
   dotnet run
   ```
4. API mặc định sẽ chạy tại địa chỉ: `http://localhost:5242` hoặc `https://localhost:7152`.

### 3. Khởi động Frontend UI
1. Mở terminal tại thư mục `src/frontend/RecipeApp.UI`.
2. Cài đặt các thư viện phụ thuộc:
   ```bash
   npm install
   ```
3. Khởi chạy ứng dụng ở chế độ phát triển (Development):
   ```bash
   npm run dev
   ```
4. Frontend mặc định chạy tại địa chỉ: [http://localhost:5173](http://localhost:5173).
