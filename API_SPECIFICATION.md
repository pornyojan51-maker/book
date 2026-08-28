# API Documentation

## Authentication Endpoints
- POST /api/auth/register - สมัครสมาชิก
- POST /api/auth/login - เข้าสู่ระบบ (Set HttpOnly Cookie)
- POST /api/auth/logout - ออกจากระบบ (Clear Cookie)

## Book Management (Admin Only Middleware)
- POST /api/books - เพิ่มหนังสือ (ต้องมี Admin Token)
- PUT /api/books/:id - แก้ไขข้อมูลหนังสือ
- DELETE /api/books/:id - ลบหนังสือ

## Public Endpoints
- GET /api/books - รายการหนังสือทั้งหมด (รองรับ Search/Filter)
- GET /api/books/:id - ดึงรายละเอียดหนังสือ
- GET /api/dashboard/stats - ดึงสถิติ Dashboard (ต้องมี Admin Token)

## Security Middleware
- AuthMiddleware: ตรวจสอบสถานะ Login จาก HttpOnly Cookie
- RoleMiddleware: ตรวจสอบสถานะ Admin สำหรับ Route ที่จัดการข้อมูล
- RateLimiter: ป้องกัน Brute-force Login
