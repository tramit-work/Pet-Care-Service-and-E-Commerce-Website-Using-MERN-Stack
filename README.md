# PetCare System – MERN Full Stack Pet Shop & Pet Service Management

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![React](https://img.shields.io/badge/Frontend-React%20(Vite)-61DAFB.svg)](https://react.dev/)
[![Node.js](https://img.shields.io/badge/Backend-Node.js-339933.svg)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Framework-Express.js-000000.svg)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/Database-MongoDB-47A248.svg)](https://www.mongodb.com/)
[![GitHub](https://img.shields.io/badge/GitHub-PetCare-blue.svg)](https://github.com/)

---

# Giới thiệu

**PetCare System** là hệ thống quản lý cửa hàng và dịch vụ chăm sóc thú cưng được phát triển theo kiến trúc **MERN Stack (MongoDB, Express.js, React.js, Node.js)**.

Hệ thống cung cấp đầy đủ chức năng cho:

- Khách hàng mua sắm sản phẩm
- Đặt lịch dịch vụ chăm sóc thú cưng
- Quản lý thú cưng
- Thanh toán đơn hàng
- Đánh giá sản phẩm
- Quản trị cửa hàng thông qua trang Admin

Đây là đồ án tốt nghiệp với mục tiêu xây dựng một hệ thống thương mại điện tử hiện đại, bảo mật và có khả năng mở rộng.

---

# Mục tiêu dự án

PetCare được xây dựng nhằm:

- Xây dựng Website thương mại điện tử cho cửa hàng thú cưng.
- Quản lý sản phẩm, thú cưng và dịch vụ.
- Hỗ trợ đặt lịch Spa, Tiêm phòng và Chăm sóc thú cưng.
- Tích hợp Authentication hiện đại.
- Áp dụng kiến trúc MERN Stack.
- Thiết kế Responsive trên Desktop, Tablet và Mobile.
- Xây dựng RESTful API theo chuẩn.

---

# Chức năng chính

## Người dùng (Customer)

- Đăng ký tài khoản
- Đăng nhập
- Google OAuth Login
- Xác thực Email
- Quên mật khẩu
- Quản lý Profile
- Quản lý Avatar
- Đổi mật khẩu
- Quản lý Session đăng nhập
- Xem lịch sử đơn hàng
- Theo dõi Booking
- Đánh giá sản phẩm

---

## Mua sắm

- Danh sách sản phẩm
- Danh mục sản phẩm
- Tìm kiếm
- Lọc theo giá
- Lọc theo đánh giá
- Sắp xếp
- Quick View
- Wishlist
- Shopping Cart
- Checkout
- Đặt hàng
- Theo dõi trạng thái đơn hàng

---

## Thú cưng

- Danh sách thú cưng
- Chi tiết thú cưng
- Quản lý trạng thái nhận nuôi
- Thông tin sức khỏe
- Tiêm phòng
- Hình ảnh

---

## Dịch vụ

- Spa
- Grooming
- Vaccination
- Health Check
- Pet Transport
- Pet Training

Khách hàng có thể:

- Đặt lịch
- Xem lịch sử
- Theo dõi trạng thái

---

## Review

- Đánh giá sau khi mua
- Chỉnh sửa đánh giá
- Rating trung bình
- Quản trị viên kiểm duyệt Review

---

## Quản trị viên (Admin)

- Dashboard
- Quản lý Users
- Quản lý Products
- Quản lý Categories
- Quản lý Pets
- Quản lý Orders
- Quản lý Bookings
- Quản lý Reviews
- Upload hình ảnh

---

# Kiến trúc hệ thống

```text
React (Vite)
        │
        ▼
RESTful API
        │
Express.js
        │
Business Logic
        │
MongoDB + Mongoose
```

Hệ thống được xây dựng theo mô hình phân tầng:

- Presentation Layer
- API Layer
- Business Layer
- Data Layer

---

# Công nghệ sử dụng

## Frontend

- React.js
- Vite
- React Router DOM
- Axios
- Context API
- CSS3

---

## Backend

- Node.js
- Express.js
- JWT Authentication
- Google OAuth
- Multer
- Nodemailer
- bcryptjs

---

## Database

- MongoDB
- Mongoose

---

## Development Tools

- Git
- GitHub
- Postman
- MongoDB Compass
- Visual Studio Code

---

# Cấu trúc thư mục

```text
PetCare/

├── frontend/
│   ├── src/
│   ├── public/
│   └── package.json
│
├── backend/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── utils/
│   ├── uploads/
│   └── package.json
│
├── docs/
│   ├── API_DOCUMENTATION.md
│   ├── DATABASE_DOCUMENTATION.md
│   ├── USER_GUIDE.md
│   ├── ADMIN_GUIDE.md
│   ├── DEPLOYMENT_GUIDE.md
│   └── RELEASE_CHECKLIST.md
│
├── README.md
└── LICENSE
```

---

# Cơ sở dữ liệu

Hệ thống sử dụng **MongoDB** với các Collection chính:

- Users
- Products
- Categories
- Pets
- Orders
- Bookings
- Reviews
- Wishlist
- Cart
- Notifications

Chi tiết:

```text
docs/DATABASE_DOCUMENTATION.md
```

---

# RESTful API

Backend xây dựng theo chuẩn RESTful API.

Bao gồm:

- Authentication
- Users
- Products
- Categories
- Pets
- Booking
- Cart
- Wishlist
- Orders
- Checkout
- Reviews
- Upload
- Admin

Chi tiết:

```text
docs/API_DOCUMENTATION.md
```

---

# Hướng dẫn cài đặt

## Clone Project

```bash
git clone https://github.com/your-username/PetCare.git

cd PetCare
```

---

## Backend

```bash
cd backend

npm install

npm run dev
```

---

## Frontend

```bash
cd frontend

npm install

npm run dev
```

---

# Environment Variables

Backend

```env
PORT=

NODE_ENV=

MONGO_URI=

JWT_SECRET=

CLIENT_URL=

SMTP_HOST=

SMTP_PORT=

SMTP_USER=

SMTP_PASS=

GOOGLE_CLIENT_ID=
```

Frontend

```env
VITE_API_BASE_URL=

VITE_GOOGLE_CLIENT_ID=
```

---

# Giao diện hệ thống

> Thêm ảnh chụp màn hình tại đây.

- Trang chủ
- Shopping
- Product Detail
- Cart
- Checkout
- Booking
- Profile
- Admin Dashboard

---

# Deployment

Hệ thống có thể triển khai trên:

- Render
- Railway
- Vercel
- Netlify
- MongoDB Atlas

Chi tiết:

```text
docs/DEPLOYMENT_GUIDE.md
```

---

# Tài liệu dự án

- API Documentation
- Database Documentation
- User Guide
- Admin Guide
- Deployment Guide
- Release Checklist

Tất cả được lưu trong thư mục:

```text
docs/
```

---

# Kết quả đạt được

- Xây dựng thành công Website MERN Full Stack.
- Thiết kế Responsive.
- Authentication bằng JWT.
- Google OAuth.
- Email Verification.
- Shopping Cart.
- Wishlist.
- Booking Service.
- Order Management.
- Review System.
- Admin Dashboard.
- RESTful API.

---

# Hướng phát triển

Trong tương lai, hệ thống có thể mở rộng:

- Thanh toán VNPay / MoMo
- Chatbot AI hỗ trợ khách hàng
- Recommendation System
- Pet Health Tracking
- Notification Realtime (Socket.IO)
- Docker & CI/CD
- Cloud Storage (Cloudinary, AWS S3)

---

# Tác giả

**Trâm Ngọc-Bảo Nguyễn**

Faculty of Information Technology

Van Lang University

Ho Chi Minh City, Vietnam

GitHub

```text
https://github.com/your-github
```

Email

```text
your-email@gmail.com
```

---

# License

This project is licensed under the MIT License.
