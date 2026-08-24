Prompt สำหรับสร้าง E-Book Web Application (Cloudflare Stack)คำสั่งสำหรับ AI (System Instruction):คุณคือผู้เชี่ยวชาญด้านการพัฒนา Web Application แบบ Serverless โดยใช้ Cloudflare Ecosystem กรุณาสร้างโปรเจกต์เว็บแอปพลิเคชันอ่านหนังสือออนไลน์ (E-Book) ตามโครงสร้างและข้อกำหนดด้านล่างนี้ โดยเขียนโค้ดให้ครบถ้วนทั้ง Frontend และ Backend1. ข้อมูลภาพรวม (Project Overview)ประเภทแอปพลิเคชัน: ระบบอ่านและจัดการ E-Book ออนไลน์Tech Stack (Backend): Hono.js (ทำงานบน Cloudflare Pages Functions / Workers)Tech Stack (Database & Storage): Cloudflare D1 (SQLite) และ Cloudflare R2Tech Stack (Frontend): HTML5, Vanilla JavaScript, Bootstrap 5 (ไม่ใช้ React/Vue เพื่อความเบาและรวดเร็ว)เป้าหมายหลัก: ระบบต้องมีความปลอดภัยสูง (Zero-Trust), ป้องกันการแฮ็กผ่าน F12 และตรวจสอบสิทธิ์ผ่าน HttpOnly Cookie เสมอ2. โครงสร้างโฟลเดอร์ (Project Structure)กรุณาสร้างโปรเจกต์ตามโครงสร้างไฟล์ดังต่อไปนี้:ebook-web-app/
├── public/                 # สคริปต์และไฟล์หน้าบ้าน (Frontend)
│   ├── index.html          # หน้าแรก / หน้า Login
│   ├── dashboard.html      # หน้า Dashboard สำหรับ Admin
│   ├── books.html          # หน้าค้นหาและอ่านหนังสือสำหรับ Member
│   ├── css/
│   │   └── style.css       # ไฟล์ CSS หลัก
│   └── js/
│       ├── app.js          # Logic หลักของ Frontend
│       └── auth.js         # จัดการการ Login และตรวจสอบสถานะหน้าบ้าน
├── src/                    # โค้ดหลังบ้าน (Backend - Hono.js)
│   ├── index.ts            # Entry point ของ Hono.js (Router หลัก)
│   ├── routes/
│   │   ├── auth.ts         # API สำหรับ Login/Register/Logout
│   │   └── books.ts        # API สำหรับ CRUD หนังสือ
│   └── middleware/
│       ├── authGuard.ts    # ตรวจสอบ JWT จาก HttpOnly Cookie
│       └── roleGuard.ts    # ตรวจสอบ Role (Admin/Member)
├── schema.sql              # คำสั่ง SQL สำหรับสร้างตารางใน Cloudflare D1
├── wrangler.toml           # ไฟล์ตั้งค่า Cloudflare (D1, R2 binding)
└── package.json            # Dependencies (hono, bcryptjs, etc.)
3. โครงสร้างฐานข้อมูล (Database Schema - schema.sql)สร้างคำสั่ง SQL สำหรับ Cloudflare D1 ดังนี้:DROP TABLE IF EXISTS Users;
CREATE TABLE Users (
    UserID TEXT PRIMARY KEY,
    Username TEXT UNIQUE NOT NULL,
    PasswordHash TEXT NOT NULL,
    Email TEXT UNIQUE NOT NULL,
    Role TEXT DEFAULT 'MEMBER', -- 'ADMIN' หรือ 'MEMBER'
    Status TEXT DEFAULT 'ACTIVE',
    CreatedDate DATETIME DEFAULT CURRENT_TIMESTAMP
);

DROP TABLE IF EXISTS Books;
CREATE TABLE Books (
    BookID TEXT PRIMARY KEY,
    BookName TEXT NOT NULL,
    Author TEXT,
    CategoryID INTEGER,
    Description TEXT,
    CoverURL TEXT,
    FileURL TEXT,
    Status TEXT DEFAULT 'PUBLISHED',
    ViewCount INTEGER DEFAULT 0
);
4. ข้อกำหนดของ API (API Routes - Hono.js)Auth Routes:POST /api/auth/register : สมัครสมาชิก และ Hash Password ด้วย bcryptjsPOST /api/auth/login : ตรวจสอบผู้ใช้ หากสำเร็จให้คืนค่า JWT กลับไปในรูปแบบ HttpOnly, Secure, SameSite=Strict CookiePOST /api/auth/logout : เคลียร์ CookieBooks Routes:GET /api/books : ดึงข้อมูลหนังสือ (เข้าถึงได้ทุกคนที่ Login)POST /api/books : เพิ่มหนังสือ (ต้องผ่าน authGuard และ roleGuard ว่าเป็น ADMIN)PUT /api/books/:id : แก้ไขหนังสือ (ADMIN เท่านั้น)DELETE /api/books/:id : ลบหนังสือ (ADMIN เท่านั้น)5. ข้อบังคับด้านความปลอดภัย (Strict Security Requirements)No LocalStorage for Tokens: ห้ามส่ง Token กลับไปให้ Frontend เก็บใน LocalStorage เด็ดขาด ให้ใช้ setCookie ของ Hono.js กำหนดเป็น httpOnly: true เสมอZero-Trust Backend: ทุก API Endpoint ที่ทำการเปลี่ยนแปลงข้อมูล (POST/PUT/DELETE) ต้องตรวจสอบสิทธิ์ผู้ใช้จาก Token ที่อยู่ใน Cookie เสมอ ห้ามรับค่า Role จากตัวแปรที่ Frontend ส่งมาF12 Anti-Tampering: หากมี Request เรียก API ระดับ Admin เข้ามาโดยที่ Token ระบุว่าเป็น Member ระบบต้องคืนค่า 403 Forbidden ทันทีคำสั่งเริ่มทำงาน:กรุณาสร้างไฟล์ wrangler.toml, package.json, schema.sql, และโค้ดพื้นฐานของ src/index.ts (Hono.js) พร้อมระบบ Middleware ตรวจสอบสิทธิ์ (Auth Guard) เป็นอันดับแรก