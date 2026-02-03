# 🏠 ROOMIFY – Smart Rental Management System

Roomify là hệ thống quản lý nhà trọ thông minh, hỗ trợ chủ trọ và người thuê trọ trong việc quản lý phòng, điện nước, hóa đơn, thanh toán và sự cố phòng ở. Hệ thống được xây dựng theo kiến trúc Next.js Fullstack, sử dụng Google Sheet như database, tích hợp OCR, QR Payment và Notification.

## 🚀 Tính năng chính

### 👤 Người thuê trọ (Tenant)
- Đăng nhập bằng số điện thoại
- Quản lý thông tin cá nhân (CCCD, họ tên, ảnh CCCD)
- Upload ảnh đồng hồ điện / nước (OCR tự đọc số)
- Xác nhận hoặc chỉnh sửa số điện / nước
- Xem thống kê tiêu thụ (theo tháng, so sánh nhiều tháng)
- Xem hóa đơn tiền trọ
- Thanh toán bằng QR Code (VietQR / Sepay / Momo / ZaloPay)
- Xem lịch sử thanh toán
- Nhận thông báo nhắc hạn / quá hạn
- Gửi yêu cầu sửa chữa, báo sự cố (kèm ảnh/video)

### 🧑‍💼 Chủ trọ (Admin)
- Quản lý người thuê
- Quản lý phòng (giá phòng, điện, nước, phụ phí)
- Quản lý hợp đồng thuê
- Duyệt / chỉnh sửa số điện nước OCR
- Quản lý hóa đơn & trạng thái thanh toán
- Nhận webhook thanh toán từ Sepay
- Thống kê điện nước, tài chính theo tháng
- Xuất báo cáo (Excel / PDF)
- Quản lý sự cố & dịch vụ
- Gửi nhắc thanh toán tự động (Zalo OA)

## 🧱 Kiến trúc tổng thể

```
[ Next.js Frontend ]
        |
        |  HTTP (fetch / axios)
        v
[ Next.js Backend - Route API ]
        |
        |  Google Sheets API
        v
[ Google Sheet (Database) ]
```

### 🔹 Giải thích
- **Frontend**: Next.js (App Router)
- **Backend**: Next.js Route API (serverless)
- **Database**: Google Sheet (mỗi sheet = 1 table)
- **OCR**: Google Vision API / Tesseract OCR
- **Thanh toán**: Sepay (QR + webhook)
- **Thông báo**: Zalo OA + Web/App Notification

## 🗂️ Database Design (Google Sheet)

### 📌 users
| Field       | Type      | Description          |
|-------------|-----------|----------------------|
| user_id     | string    | PK, auto increment   |
| phone       | string    | login (unique)       |
| full_name   | string    |                      |
| cccd        | string    |                      |
| cccd_image  | string    |                      |
| role        | enum      | admin / tenant       |
| created_at  | datetime  |                      |

### 📌 rooms
| Field          | Type      | Description          |
|----------------|-----------|----------------------|
| room_id        | string    | PK                   |
| room_code      | string    |                      |
| price          | number    |                      |
| electric_price | number    |                      |
| water_price    | number    |                      |
| extra_fee      | number    |                      |
| status         | enum      | vacant, occupied     |
| admin_id       | string    | FK → users           |
| created_at     | datetime  |                      |

### 📌 rentals
| Field      | Type   | Description          |
|------------|--------|----------------------|
| rental_id  | string | PK                   |
| user_id    | string | tenant               |
| room_id    | string |                      |
| start_date | date   |                      |
| end_date   | date   |                      |
| status     | enum   | renting, ended       |

### 📌 meters
| Field       | Type      | Description          |
|-------------|-----------|----------------------|
| meter_id    | string    | PK                   |
| rental_id   | string    |                      |
| type        | enum      | electric, water      |
| month       | YYYY-MM   |                      |
| old_value   | number    |                      |
| new_value   | number    |                      |
| ocr_value   | number    |                      |
| image_url   | string    |                      |
| confirmed   | boolean   |                      |
| created_at  | datetime  |                      |

### 📌 invoices
| Field           | Type      | Description          |
|-----------------|-----------|----------------------|
| invoice_id      | string    | PK                   |
| rental_id       | string    |                      |
| month           | YYYY-MM   |                      |
| room_price      | number    |                      |
| electric_cost   | number    |                      |
| water_cost      | number    |                      |
| extra_fee       | number    |                      |
| total           | number    |                      |
| payment_method  | enum      |                      |
| payment_status  | enum      | unpaid, paid, failed |
| transaction_id  | string    |                      |
| paid_at         | datetime  |                      |

### 📌 issues
| Field        | Type      | Description          |
|--------------|-----------|----------------------|
| issue_id     | string    | PK                   |
| rental_id    | string    |                      |
| title        | string    |                      |
| description  | text      |                      |
| media_url    | string    |                      |
| status       | enum      | pending, processing, done |
| created_at   | datetime  |                      |

## 🧩 Backend Structure

```
src/
├── app/
│   └── api/
│       ├── users/
│       ├── rooms/
│       ├── rentals/
│       ├── meters/
│       ├── invoices/
│       └── issues/
├── services/
│   ├── user.service.ts
│   ├── room.service.ts
│   ├── rental.service.ts
│   ├── meter.service.ts
│   ├── invoice.service.ts
│   └── issue.service.ts
├── lib/
│   ├── googleSheet.ts
│   ├── autoIncrement.ts
│   └── auth.ts
├── constants/
│   └── enums.ts
└── types/
```

### 🔹 Pattern sử dụng
- Service viết bằng arrow function
- Không dùng class
- Stateless, dễ scale
- Dễ migrate sang DB thật (MySQL / PostgreSQL)

## 🔐 Authentication
- Login bằng số điện thoại
- Phân quyền bằng field `role`
- Không cần bảng admin riêng

## 💳 Thanh toán
- Sinh QR VietQR (Sepay / Momo / ZaloPay)
- Nhận webhook từ Sepay
- Cập nhật trạng thái hóa đơn real-time

## 🤖 OCR Điện / Nước
- Upload ảnh đồng hồ
- OCR trích xuất số
- User xác nhận trước khi lưu
- Admin có thể chỉnh sửa nếu sai

## 📈 Định hướng mở rộng
- Thay Google Sheet bằng PostgreSQL / MongoDB
- Mobile App (React Native)
- AI dự đoán tiêu thụ điện nước
- Auto reminder thông minh
- Multi-tenant cho nhiều khu trọ

## 🧑‍💻 Tech Stack

| Layer      | Technology                  |
|------------|-----------------------------|
| UI/UX      | Figma                       |
| Frontend   | Next.js                     |
| Backend    | Next.js Route API           |
| Database   | Google Sheet                |
| OCR        | Google Vision API           |
| Payment    | Sepay | Momo | PayOs | Cash |
| Notification | Zalo OA API               |