# Roomify - Backend Skeleton

Hệ thống quản lý trọ thông minh sử dụng Next.js và Google Sheets làm database.

## 📁 Cấu trúc thư mục

```
src/
├── app/
│   └── api/
│       ├── users/
│       │   ├── route.ts           # GET, POST users
│       │   ├── [id]/route.ts      # GET, PUT, DELETE user by ID
│       │   └── login/route.ts     # POST login by phone
│       ├── rooms/
│       │   ├── route.ts           # GET, POST rooms
│       │   └── [id]/route.ts      # GET, PUT, DELETE room by ID
│       ├── rentals/
│       │   ├── route.ts           # GET, POST rentals
│       │   └── [id]/route.ts      # GET, PUT, DELETE rental by ID
│       ├── meters/
│       │   └── route.ts           # GET, POST, PUT meter readings
│       ├── invoices/
│       │   ├── route.ts           # GET, POST invoices
│       │   └── [id]/route.ts      # GET, PUT, DELETE invoice by ID
│       ├── issues/
│       │   └── route.ts           # GET, POST, PUT issues
│       └── webhooks/
│           └── sepay/route.ts     # POST payment webhook
├── lib/
│   ├── googleSheet.ts             # Google Sheets API adapter
│   ├── autoIncrement.ts           # META sheet auto-increment ID
│   └── response.ts                # Standard API response helper
├── services/
│   ├── user.service.ts            # User business logic
│   ├── room.service.ts            # Room business logic
│   ├── rental.service.ts          # Rental business logic
│   ├── meter.service.ts           # Meter reading business logic
│   ├── invoice.service.ts         # Invoice business logic
│   └── issue.service.ts           # Issue business logic
├── types/
│   ├── user.ts                    # User interfaces
│   ├── room.ts                    # Room interfaces
│   ├── rental.ts                  # Rental interfaces
│   ├── meter.ts                   # Meter interfaces
│   ├── invoice.ts                 # Invoice interfaces
│   ├── issue.ts                   # Issue interfaces
│   └── index.ts                   # Export all types
├── constants/
│   └── enums.ts                   # All enums (roles, statuses, etc.)
└── middleware.ts                  # Role-based access control
```

## 🗄️ Database Schema (Google Sheet)

### META Sheet
| table_name | last_id |
|------------|---------|
| USERS      | 0       |
| ROOMS      | 0       |
| RENTALS    | 0       |
| METERS     | 0       |
| INVOICES   | 0       |
| ISSUES     | 0       |

### USERS Sheet
| user_id | phone | full_name | cccd | cccd_image | role | created_at |
|---------|-------|-----------|------|------------|------|------------|

### ROOMS Sheet
| room_id | room_code | price | electric_price | water_price | extra_fee | status | admin_id | created_at |
|---------|-----------|-------|----------------|-------------|-----------|--------|----------|------------|

### RENTALS Sheet
| rental_id | user_id | room_id | start_date | end_date | status |
|-----------|---------|---------|------------|----------|--------|

### METERS Sheet
| meter_id | rental_id | type | month | old_value | new_value | ocr_value | image_url | confirmed | created_at |
|----------|-----------|------|-------|-----------|-----------|-----------|-----------|-----------|------------|

### INVOICES Sheet
| invoice_id | rental_id | month | room_price | electric_cost | water_cost | extra_fee | total | payment_method | payment_status | transaction_id | paid_at |
|------------|-----------|-------|------------|---------------|------------|-----------|-------|----------------|----------------|----------------|---------|

### ISSUES Sheet
| issue_id | rental_id | title | description | media_url | status | created_at |
|----------|-----------|-------|-------------|-----------|--------|------------|

## 🚀 Cài đặt

### 1. Cài đặt dependencies

```bash
pnpm install
```

### 2. Cấu hình Google Sheets API

1. Tạo project trong [Google Cloud Console](https://console.cloud.google.com/)
2. Enable Google Sheets API
3. Tạo Service Account và download JSON key
4. Tạo Google Spreadsheet và share với email của Service Account
5. Copy các giá trị vào `.env.local`:

```env
GOOGLE_SERVICE_ACCOUNT_EMAIL=your-service-account@your-project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
GOOGLE_SPREADSHEET_ID=your-spreadsheet-id
```

### 3. Tạo các Sheet trong Google Spreadsheet

Tạo 7 sheets với tên và header như sau:

#### META
```
table_name | last_id
USERS      | 0
ROOMS      | 0
RENTALS    | 0
METERS     | 0
INVOICES   | 0
ISSUES     | 0
```

#### USERS
```
user_id | phone | full_name | cccd | cccd_image | role | created_at
```

#### ROOMS
```
room_id | room_code | price | electric_price | water_price | extra_fee | status | admin_id | created_at
```

#### RENTALS
```
rental_id | user_id | room_id | start_date | end_date | status
```

#### METERS
```
meter_id | rental_id | type | month | old_value | new_value | ocr_value | image_url | confirmed | created_at
```

#### INVOICES
```
invoice_id | rental_id | month | room_price | electric_cost | water_cost | extra_fee | total | payment_method | payment_status | transaction_id | paid_at
```

#### ISSUES
```
issue_id | rental_id | title | description | media_url | status | created_at
```

### 4. Chạy development server

```bash
pnpm dev
```

## 📚 API Endpoints

### Users
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/users | Lấy danh sách users |
| POST | /api/users | Tạo user mới |
| GET | /api/users/[id] | Lấy user theo ID |
| PUT | /api/users/[id] | Cập nhật user |
| DELETE | /api/users/[id] | Xóa user |
| POST | /api/users/login | Đăng nhập bằng SĐT |

### Rooms
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/rooms | Lấy danh sách phòng |
| GET | /api/rooms?admin_id=1 | Lấy phòng theo admin |
| GET | /api/rooms?status=vacant | Lấy phòng trống |
| POST | /api/rooms | Tạo phòng mới |
| GET | /api/rooms/[id] | Lấy phòng theo ID |
| PUT | /api/rooms/[id] | Cập nhật phòng |
| DELETE | /api/rooms/[id] | Xóa phòng |

### Rentals
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/rentals | Lấy danh sách hợp đồng thuê |
| GET | /api/rentals?user_id=1 | Lấy theo người thuê |
| GET | /api/rentals?room_id=1 | Lấy theo phòng |
| GET | /api/rentals?status=active | Lấy hợp đồng đang thuê |
| POST | /api/rentals | Tạo hợp đồng mới |
| GET | /api/rentals/[id] | Lấy hợp đồng theo ID |
| PUT | /api/rentals/[id] | Cập nhật hợp đồng |
| DELETE | /api/rentals/[id] | Kết thúc hợp đồng |

### Meters
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/meters | Lấy tất cả chỉ số |
| GET | /api/meters?rental_id=1 | Lấy theo hợp đồng |
| POST | /api/meters | Ghi chỉ số mới |
| PUT | /api/meters?meter_id=1 | Cập nhật/xác nhận chỉ số |

### Invoices
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/invoices | Lấy tất cả hóa đơn |
| GET | /api/invoices?rental_id=1 | Lấy theo hợp đồng |
| GET | /api/invoices?status=unpaid | Lấy hóa đơn chưa thanh toán |
| GET | /api/invoices?status=overdue | Lấy hóa đơn quá hạn |
| POST | /api/invoices | Tạo hóa đơn tháng |
| GET | /api/invoices/[id] | Lấy hóa đơn theo ID |
| PUT | /api/invoices/[id] | Cập nhật hóa đơn |
| DELETE | /api/invoices/[id] | Xóa hóa đơn |

### Issues
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/issues | Lấy tất cả sự cố |
| GET | /api/issues?rental_id=1 | Lấy theo hợp đồng |
| GET | /api/issues?status=pending | Lấy theo trạng thái |
| POST | /api/issues | Báo cáo sự cố mới |
| PUT | /api/issues?issue_id=1 | Cập nhật sự cố |

### Webhooks
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/webhooks/sepay | Nhận thông báo thanh toán từ Sepay |
| GET | /api/webhooks/sepay | Health check |

## 🔐 Authentication

Hệ thống sử dụng phone-based authentication:

1. User đăng nhập với số điện thoại
2. Server trả về thông tin user và token
3. Client gửi token trong header cho các request tiếp theo

Headers cần thiết:
```
x-user-id: 1
x-user-role: admin | tenant
x-user-phone: 0901234567
```

## 📝 Response Format

Tất cả API trả về định dạng thống nhất:

```json
{
  "success": true,
  "data": { ... },
  "message": "Success message"
}
```

Hoặc khi lỗi:

```json
{
  "success": false,
  "error": "Error message"
}
```

## 🛠️ Development

### Build
```bash
pnpm build
```

### Lint
```bash
pnpm lint
```

### Type Check
```bash
pnpm type-check
```

## 📋 TODO

- [ ] Implement JWT authentication
- [ ] Add Google Vision OCR integration
- [ ] Add Zalo OA notification service
- [ ] Add rate limiting
- [ ] Add request validation (zod)
- [ ] Add unit tests
- [ ] Add API documentation (Swagger)
