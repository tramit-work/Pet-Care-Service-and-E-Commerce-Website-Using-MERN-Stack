# PetCare System (MERN)

Phiên bản MERN Stack được chuyển đổi từ project Flask "Pet Shop" cũ. Toàn bộ giao diện
(HTML/CSS/màu sắc/layout/responsive/hình ảnh) được giữ nguyên; chỉ thay đổi kiến trúc
kỹ thuật sang MongoDB + Express + React + Node.js.

## Trạng thái hiện tại: Bước 2 — React Layout dùng chung (Navbar, Footer, Router)

Đã hoàn thành: Layout dùng chung (Navbar + Footer + Router), tách thành nhiều component nhỏ.
Home/Shopping/Service/Contact hiện là **placeholder tạm thời**, nội dung thật sẽ lần lượt
được xây ở Bước 3-6 theo đúng lộ trình.

## Cấu trúc thư mục

```
petcare-system/
├── backend/            # Node.js + Express + MongoDB (Mongoose)
│   ├── config/         # Kết nối database
│   ├── controllers/    # Xử lý logic request/response (sẽ thêm từ Bước 3)
│   ├── middleware/      # notFound, errorHandler (đã có), auth/role (sẽ thêm)
│   ├── models/         # Schema Mongoose (sẽ thêm từ Bước 3)
│   ├── routes/          # Định tuyến API
│   ├── services/        # Business logic tách riêng khỏi controllers
│   ├── validators/      # Validation input (express-validator)
│   ├── constants/       # Hằng số dùng chung (HTTP status, roles...)
│   ├── utils/            # Helper (asyncHandler, ApiError...)
│   ├── uploads/          # Ảnh upload qua Multer (Bước 9)
│   └── server.js         # Entry point
├── frontend/            # React (Vite) + React Router + Axios + Context API
│   ├── public/images/    # Ảnh tĩnh copy nguyên vẹn từ Flask project
│   └── src/
│       ├── api/               # axiosClient dùng chung
│       ├── assets/styles/     # style.css gốc (2 bổ sung nhỏ: .nav-menu a.active, .footer-bottom)
│       ├── components/
│       │   ├── layout/        # Layout.jsx (Navbar + Outlet + Footer)
│       │   ├── navbar/        # Navbar, NavLogo, NavMenu, NavIcons, NavSearch
│       │   ├── footer/        # Footer, FooterNewsletter, FooterContactInfo, FooterLinkList, FooterBottom
│       │   └── common/        # ComingSoonNotice (placeholder dùng chung, sẽ xoá dần ở Bước 3-6)
│       ├── context/            # AuthContext
│       ├── pages/               # HomePage/ShoppingPage/ServicePage/ContactPage/LoginPage/RegisterPage/NotFoundPage
│       └── router/               # AppRouter (đã khai báo đủ route, bao gồm 404)
├── docs/                # Tài liệu bổ sung
├── postman/             # Postman collection (sẽ thêm dần theo từng API)
└── README.md
```

## Yêu cầu môi trường

- Node.js >= 18
- MongoDB (local hoặc MongoDB Atlas)

## Cài đặt & chạy thử

### Backend

```bash
cd backend
cp .env.example .env
# Sửa MONGO_URI trong .env trỏ tới MongoDB thật của bạn (local hoặc Atlas)
npm install
npm run dev
```

Kiểm tra: mở `http://localhost:5000/api/health` — nếu MongoDB kết nối đúng sẽ thấy
`"mongo": "connected"`.

### Frontend

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

Mở `http://localhost:5173` — sẽ thấy trang xác nhận scaffolding (logo + CSS gốc + trạng thái
kết nối backend).

## Ghi chú kiến trúc đã thống nhất (áp dụng từ Bước 3 trở đi)

- **Pets và Products**: 2 collection MongoDB tách riêng. Trang *Shopping* chỉ hiển thị
  `products`; trang *Home* hiển thị cả `pets` và `products` nổi bật.
- **Giỏ hàng**: không tạo collection `cart` riêng. Giỏ hàng được lưu dưới dạng mảng nhúng
  trong document `User` (`cart: [{ product, quantity }]`). Khi checkout, dữ liệu giỏ hàng
  được copy sang một document `Order` mới (bất biến, dùng cho lịch sử đơn hàng), sau đó
  giỏ hàng trong `User` được xóa.
- **Chatbot/Rasa**: không port từ project Flask cũ sang, theo đúng yêu cầu phạm vi dự án.

## Roadmap các bước tiếp theo

1. ~~Scaffolding~~ (đã xong)
2. ~~React Layout dùng chung (Navbar, Footer, Router)~~ (đã xong)
3. Trang Home (hero slider, sản phẩm/pet nổi bật, bài viết)
4. Trang Shopping (danh sách `products`, tìm kiếm, lọc, phân trang)
5. Trang Service (danh sách dịch vụ, form đặt lịch)
6. Trang Contact (form liên hệ)
7. Backend: User model + Auth (JWT, bcrypt) + middleware role
8. Backend: Category/Pet/Product model + CRUD + list/detail/search/filter công khai
9. Frontend: nối Home/Shopping với API thật
10. Backend + Frontend: Giỏ hàng (nhúng trong User) & Order
11. Backend + Frontend: Booking (đặt lịch dịch vụ)
12. Backend + Frontend: Review (product & service)
13. Backend + Frontend: Admin Dashboard + CRUD toàn bộ entity + upload ảnh Multer
14. Hoàn thiện: validation toàn diện, README chi tiết, Postman collection đầy đủ

## Ghi chú Bước 2: 2 lỗi đã phát hiện và khắc phục trong bản Flask gốc

- **Menu mobile không hoạt động**: `script.js` gốc gọi `document.getElementById('navMenu')`
  nhưng thẻ `<ul class="nav-menu">` không có `id="navMenu"` → menu mobile im lặng không phản
  hồi khi bấm. Đã khắc phục bằng React state (`mobileMenuOpen`) toggle đúng class `.active`
  mà CSS đã chờ sẵn.
- **`script.js` bị crash giữa chừng trên `service.html`/`contact.html`**: dòng đầu file gọi
  `document.getElementById('searchHomeBtn').addEventListener(...)` nhưng phần tử này chỉ tồn
  tại trên `home.html`, khiến toàn bộ phần script phía sau (kể cả nút mở form đặt lịch spa)
  không chạy trên 2 trang kia. Kiến trúc component-scoped của React loại bỏ hoàn toàn lỗi này.

## Ghi chú Bước 2: 2 thay đổi CSS nhỏ (có chủ đích, đã disclose)

- `.nav-menu a.active` — style cho `NavLink` đang active, dùng lại đúng màu `--light-red`
  đã có sẵn ở `:hover` để đồng bộ thiết kế.
- `.footer-bottom` — dòng copyright mới (bản gốc chưa từng có), dùng đúng font/màu đã dùng
  trong `.footer-section`.
