1. ภาพรวม

API ของ Lumina Books รองรับการสมัครสมาชิก เข้าสู่ระบบ อ่านและจัดการหนังสือ
ระบบผู้แต่ง ระบบแยกตอน และระบบหลังบ้านสำหรับผู้ดูแลระบบ

หลักการสำคัญ:

สมาชิกสมัครบัญชีและเข้าสู่ระบบได้

ใช้ HttpOnly Cookie สำหรับ Authentication

ผู้ดูแลระบบสามารถดูสมาชิกจริงจากฐานข้อมูลผ่าน Backend

แต่ละตอนของหนังสือเป็นข้อมูลแยกจากกัน

รองรับ Workflow การนำไฟล์ Word .docx มาแปลงเป็นเนื้อหาของแต่ละตอน

API ที่เป็น Admin ต้องตรวจสอบสิทธิ์ที่ Backend

ห้ามส่ง password, passwordHash, token หรือ secret กลับไปยัง Frontend

2. Authentication

2.1 สมัครสมาชิก

POST /api/auth/register

Request:

POST /api/auth/register
Content-Type: application/json

Body:

{
  "username": "example_user",
  "email": "example@example.com",
  "password": "password"
}

Success:

{
  "success": true,
  "message": "สมัครสมาชิกสำเร็จ",
  "user": {
    "id": "USER_ID",
    "username": "example_user",
    "email": "example@example.com",
    "role": "user"
  }
}

Password ต้องถูก Hash ก่อนบันทึก Database และห้ามเก็บ Plain Text

2.2 เข้าสู่ระบบ

POST /api/auth/login

Body:

{
  "username": "example_user",
  "password": "password"
}

เมื่อสำเร็จ Server ต้องกำหนด Authentication Cookie เป็น HttpOnly

Response:

{
  "success": true,
  "message": "เข้าสู่ระบบสำเร็จ",
  "user": {
    "id": "USER_ID",
    "username": "example_user",
    "email": "example@example.com",
    "role": "user"
  }
}

ไม่ควรเก็บ JWT ใน localStorage หรือ sessionStorage

2.3 ออกจากระบบ

POST /api/auth/logout

Response:

{
  "success": true,
  "message": "ออกจากระบบสำเร็จ"
}

Server ต้องล้าง Authentication Cookie

2.4 ตรวจสอบผู้ใช้ปัจจุบัน

GET /api/auth/me

Response เมื่อ Login:

{
  "authenticated": true,
  "user": {
    "id": "USER_ID",
    "username": "example_user",
    "email": "example@example.com",
    "role": "user"
  }
}

เมื่อไม่ได้ Login:

{
  "authenticated": false,
  "user": null
}

3. Middleware

AuthMiddleware

ทำหน้าที่:

อ่าน Authentication Cookie

ตรวจ JWT

ตรวจอายุ Token

ระบุผู้ใช้ปัจจุบัน

ส่งข้อมูลผู้ใช้ให้ Route

ไม่ได้ Login:

401 Unauthorized

RoleMiddleware

ใช้กับ API ที่ต้องการสิทธิ์เฉพาะ เช่น Admin

AuthMiddleware
      ↓
RoleMiddleware
      ↓
role === "admin"

ไม่ใช่ Admin:

403 Forbidden

RateLimiter

ใช้ป้องกัน Brute-force โดยเฉพาะ:

POST /api/auth/login
POST /api/auth/register

เมื่อเกินกำหนด:

429 Too Many Requests

4. Public Book API

4.1 รายการหนังสือ

GET /api/books

รองรับ Query:

search
category
author
page
limit

ตัวอย่าง:

GET /api/books?search=ประวัติศาสตร์

Response:

{
  "success": true,
  "books": [
    {
      "id": "BOOK_ID",
      "title": "ชื่อหนังสือ",
      "author": "ชื่อผู้แต่ง",
      "description": "รายละเอียด",
      "category": "วรรณกรรม",
      "cover": "cover-url"
    }
  ]
}

4.2 รายละเอียดหนังสือ

GET /api/books/:id

Response:

{
  "success": true,
  "book": {
    "id": "BOOK_ID",
    "title": "ชื่อหนังสือ",
    "author": "ชื่อผู้แต่ง",
    "description": "รายละเอียด",
    "category": "วรรณกรรม",
    "cover": "cover-url"
  }
}

5. Book Management --- Admin

API ต่อไปนี้ต้องผ่าน AuthMiddleware และ RoleMiddleware:

POST   /api/books
PUT    /api/books/:id
DELETE /api/books/:id

5.1 เพิ่มหนังสือ

POST /api/books

Body:

{
  "title": "ชื่อหนังสือ",
  "author": "ชื่อผู้แต่ง",
  "description": "รายละเอียดหนังสือ",
  "category": "วรรณกรรม",
  "cover": "cover-url"
}

5.2 แก้ไขหนังสือ

PUT /api/books/:id

Body:

{
  "title": "ชื่อหนังสือใหม่",
  "author": "ผู้แต่งใหม่",
  "description": "รายละเอียดใหม่",
  "category": "หมวดใหม่"
}

5.3 ลบหนังสือ

DELETE /api/books/:id

Response:

{
  "success": true,
  "message": "ลบหนังสือสำเร็จ"
}

6. Author API

6.1 รายชื่อผู้แต่ง

GET /api/authors

6.2 รายละเอียดผู้แต่ง

GET /api/authors/:id

6.3 สร้างผู้แต่ง

POST /api/authors

Body:

{
  "name": "ชื่อผู้แต่ง",
  "bio": "ประวัติผู้แต่ง"
}

Response:

{
  "success": true,
  "author": {
    "id": "AUTHOR_ID",
    "name": "ชื่อผู้แต่ง",
    "bio": "ประวัติผู้แต่ง"
  }
}

สิทธิ์การสร้าง/แก้ไขผู้แต่งต้องกำหนดตาม Policy ของระบบ

7. Chapter API --- แยกแต่ละตอนเป็นข้อมูลอิสระ

หนังสือหนึ่งเล่มสามารถมีหลายตอน:

BOOK
├── Chapter 1
├── Chapter 2
├── Chapter 3
└── Chapter 4

แต่ละตอนต้องมี id ของตัวเอง และไม่ควรเก็บทุกตอนเป็นข้อมูลก้อนเดียว

ตัวอย่าง:

{
  "bookId": "BOOK_ID",
  "chapters": [
    {
      "id": "CHAPTER_001",
      "number": 1,
      "title": "ประตูที่ไม่ควรเปิด",
      "content": "<p>เนื้อหาตอนที่ 1</p>"
    },
    {
      "id": "CHAPTER_002",
      "number": 2,
      "title": "ห้องลับ",
      "content": "<p>เนื้อหาตอนที่ 2</p>"
    }
  ]
}

7.1 เพิ่มตอน

POST /api/books/:bookId/chapters

Body:

{
  "number": 1,
  "title": "ตอนที่ 1",
  "content": "<p>เนื้อหา</p>",
  "source": "ตอนที่-1.docx"
}

ต้องตรวจ:

bookId มีอยู่จริง

หมายเลขตอนถูกต้อง

หมายเลขตอนซ้ำไม่ได้ในหนังสือเดียวกัน

title ไม่ว่าง

content ไม่ว่าง

จำกัดขนาด Request

7.2 รายการตอน

GET /api/books/:bookId/chapters

7.3 อ่านตอน

GET /api/books/:bookId/chapters/:chapterId

Response:

{
  "success": true,
  "chapter": {
    "id": "CHAPTER_ID",
    "bookId": "BOOK_ID",
    "number": 1,
    "title": "ตอนที่ 1",
    "content": "<p>เนื้อหาของตอน</p>"
  }
}

7.4 แก้ไขตอน

PUT /api/books/:bookId/chapters/:chapterId

Body:

{
  "number": 1,
  "title": "ชื่อใหม่",
  "content": "<p>เนื้อหาใหม่</p>"
}

7.5 ลบตอน

DELETE /api/books/:bookId/chapters/:chapterId

8. Word .docx

Frontend สามารถอ่านไฟล์ Word .docx แล้วแปลงเป็น HTML ก่อนบันทึกเป็น Chapter

ตอนที่ 1.docx
      ↓
อ่านไฟล์
      ↓
แปลงเป็น HTML
      ↓
POST /api/books/:bookId/chapters
      ↓
Chapter 1

ตัวอย่าง:

ตอนที่ 1.docx → Chapter 1
ตอนที่ 2.docx → Chapter 2
ตอนที่ 3.docx → Chapter 3

แต่ละตอนเป็นข้อมูลแยกกัน

หาก Backend ต้องการรับไฟล์ .docx โดยตรง ต้องสร้าง Multipart Upload API
เพิ่มต่างหาก

9. Admin Member Management --- สมาชิกจริง

ระบบหลังบ้านต้องดึงสมาชิกจาก Database จริงผ่าน Backend

เมื่อ Admin กด:

⚙️ ระบบหลังบ้าน

Frontend ต้องเรียก:

GET /api/admin/users

ไม่ใช้ข้อมูลสมาชิกตัวอย่างที่ฝังอยู่ใน HTML

9.1 ดูสมาชิกทั้งหมด

GET /api/admin/users

Permission:

Login Required: YES
Role Required: admin

Middleware:

AuthMiddleware
RoleMiddleware

Response:

{
  "success": true,
  "users": [
    {
      "id": "USER_001",
      "username": "member01",
      "name": "สมาชิกตัวอย่าง",
      "email": "member01@example.com",
      "role": "user",
      "status": "active",
      "createdAt": "2026-08-28T10:00:00.000Z"
    }
  ]
}

9.2 ดูสมาชิกตาม ID

GET /api/admin/users/:id

Permission:

Login Required: YES
Role Required: admin

9.3 ค้นหาสมาชิก

GET /api/admin/users?search=คำค้นหา

ค้นหาได้จากข้อมูลที่ระบบอนุญาต เช่น:

username
name
email

9.4 ตัวกรองสมาชิก

รองรับ:

search
role
status
page
limit

ตัวอย่าง:

GET /api/admin/users?role=user
GET /api/admin/users?role=admin
GET /api/admin/users?status=active
GET /api/admin/users?search=สมชาย&status=active

10. Pagination สมาชิก

ตัวอย่าง:

GET /api/admin/users?page=1&limit=20

Response:

{
  "success": true,
  "users": [],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}

11. ข้อมูลสมาชิกที่ห้ามส่งกลับ

ห้ามส่ง:

password
passwordHash
token
refreshToken
secret
API key
database credential

ข้อมูลที่ Admin ใช้แสดงผลควรเป็น:

id
username
name
email
role
status
createdAt

12. Dashboard Statistics

GET /api/dashboard/stats

Permission:

Login Required: YES
Role Required: admin

Response:

{
  "success": true,
  "stats": {
    "totalUsers": 0,
    "totalAdmins": 0,
    "activeUsers": 0,
    "totalBooks": 0,
    "totalChapters": 0
  }
}

ค่าต้องคำนวณจาก Database จริง ไม่ Hard-code ใน Frontend

13. Frontend window.api

Frontend ควรรองรับ:

window.api = {
  register: async function(data) {},
  login: async function(data) {},
  logout: async function() {},
  getCurrentUser: async function() {},

  getBooks: async function(params) {},
  getBook: async function(id) {},
  createBook: async function(data) {},
  updateBook: async function(id, data) {},
  deleteBook: async function(id) {},

  getAuthors: async function() {},
  createAuthor: async function(data) {},

  getChapters: async function(bookId) {},
  getChapter: async function(bookId, chapterId) {},
  createChapter: async function(bookId, data) {},
  updateChapter: async function(bookId, chapterId, data) {},
  deleteChapter: async function(bookId, chapterId) {},

  getUsers: async function(params) {},
  getUser: async function(id) {},

  getDashboardStats: async function() {}
};

14. Frontend getUsers()

async function getUsers(params = {}) {

  const query =
    new URLSearchParams(params).toString();

  const url = query
    ? `${API_BASE_URL}/api/admin/users?${query}`
    : `${API_BASE_URL}/api/admin/users`;

  const response = await fetch(url, {
    method: 'GET',
    credentials: 'include',
    headers: {
      'Accept': 'application/json'
    }
  });

  if (!response.ok) {

    if (response.status === 401) {
      throw new Error('กรุณาเข้าสู่ระบบใหม่');
    }

    if (response.status === 403) {
      throw new Error(
        'คุณไม่มีสิทธิ์ดูข้อมูลสมาชิก'
      );
    }

    throw new Error(
      'ไม่สามารถโหลดข้อมูลสมาชิกได้'
    );
  }

  return await response.json();
}

15. Flow ระบบหลังบ้าน

เมื่อ Admin กดระบบหลังบ้าน:

กด "ระบบหลังบ้าน"
        ↓
ตรวจสอบ Login
        ↓
ตรวจสอบ role
        ↓
role === "admin" ?
        ↓
เปิด Admin Panel
        ↓
GET /api/admin/users
        ↓
AuthMiddleware
        ↓
RoleMiddleware
        ↓
Query Database
        ↓
ตัดข้อมูลลับออก
        ↓
JSON Response
        ↓
แสดงสมาชิกจริง

สมาชิกทั่วไป:

role === "user"
      ↓
403 Forbidden
      ↓
ไม่สามารถดูสมาชิกได้

16. HTTP Status Codes

Status   ความหมาย

200      สำเร็จ
201      สร้างข้อมูลสำเร็จ
400      Request ไม่ถูกต้อง
401      ยังไม่ได้ Login / Token ไม่ถูกต้อง
403      ไม่มีสิทธิ์
404      ไม่พบข้อมูล
409      ข้อมูลซ้ำ
429      Request มากเกินกำหนด
500      Server Error

17. Error Response

รูปแบบมาตรฐาน:

{
  "success": false,
  "error": "ERROR_CODE",
  "message": "ข้อความแจ้งเตือน"
}

ไม่ควรส่ง Stack Trace หรือข้อมูลภายใน Server ให้ผู้ใช้

18. Security Requirements

Password

ต้อง:

Hash ก่อนบันทึก

ไม่เก็บ Plain Text

ไม่ส่งกลับใน API

ไม่แสดงใน Admin Panel

Authorization

ห้ามพึ่งการซ่อนปุ่ม Admin ใน Frontend เพียงอย่างเดียว

Backend ต้องตรวจสอบสิทธิ์ทุกครั้ง:

Authentication
+
Authorization

Input Validation

ต้องตรวจสอบ:

username
email
password
bookId
chapterId
title
content
search
page
limit

และป้องกัน:

SQL Injection
XSS
Invalid Input
Oversized Request
Malformed JSON

19. File Upload Security

หาก Backend รับไฟล์โดยตรง ต้องตรวจ:

MIME Type

Extension

File Size

ไฟล์เสียหาย

ชื่อไฟล์

เนื้อหาไฟล์

ไม่ควรเชื่อ Extension จากชื่อไฟล์เพียงอย่างเดียว

20. Database Security

ข้อมูลต่อไปนี้ต้องอยู่ฝั่ง Server:

DATABASE_URL
DB_PASSWORD
DB_SECRET
API_KEY
JWT_SECRET

ห้ามใส่ไว้ใน:

index.html
app.js
public/
CSS

21. CORS

หาก Frontend และ Backend อยู่คนละ Origin ต้องกำหนด CORS ให้ตรงกับ Origin
ที่อนุญาต

ไม่ควรใช้:

Access-Control-Allow-Origin: *

ร่วมกับ Credentialed Cookie

เมื่อใช้ Cookie ข้าม Origin ต้องกำหนด CORS และ Credentials ให้ถูกต้องทั้งสองฝั่ง

22. CSRF Protection

เนื่องจาก Authentication ใช้ Cookie ควรมีมาตรการป้องกัน CSRF เช่น:

SameSite Cookie
CSRF Token
Origin/Referer Validation

โดยเฉพาะ:

POST
PUT
PATCH
DELETE

23. Health Check

GET /api/health

Response:

{
  "success": true,
  "status": "ok"
}

หากตรวจ Database:

{
  "success": true,
  "status": "ok",
  "database": "connected"
}

ห้ามส่ง Credential หรือ Secret ออกมา

24. API Route Summary

Authentication

POST /api/auth/register
POST /api/auth/login
POST /api/auth/logout
GET  /api/auth/me

Books

GET    /api/books
GET    /api/books/:id
POST   /api/books
PUT    /api/books/:id
DELETE /api/books/:id

Authors

GET  /api/authors
GET  /api/authors/:id
POST /api/authors

Chapters

GET    /api/books/:bookId/chapters
GET    /api/books/:bookId/chapters/:chapterId
POST   /api/books/:bookId/chapters
PUT    /api/books/:bookId/chapters/:chapterId
DELETE /api/books/:bookId/chapters/:chapterId

Admin Members

GET /api/admin/users
GET /api/admin/users/:id

Dashboard

GET /api/dashboard/stats

Health

GET /api/health

25. API Permission Matrix

API                            Guest     User   Admin

POST /api/auth/register          ✓        ✓       ✓
POST /api/auth/login             ✓        ✓       ✓
POST /api/auth/logout           -        ✓       ✓
GET /api/auth/me                 ✓        ✓       ✓
GET /api/books                   ✓        ✓       ✓
GET /api/books/:id               ✓        ✓       ✓
POST /api/books                  ✗   Policy       ✓
PUT /api/books/:id               ✗   Policy       ✓
DELETE /api/books/:id            ✗   Policy       ✓
GET /api/authors                 ✓        ✓       ✓
POST /api/authors                ✗   Policy       ✓
GET Chapters                       ✓        ✓       ✓
POST Chapter                       ✗   Policy       ✓
PUT Chapter                        ✗   Policy       ✓
DELETE Chapter                     ✗   Policy       ✓
GET /api/admin/users             ✗        ✗       ✓
GET /api/admin/users/:id         ✗        ✗       ✓
GET /api/dashboard/stats         ✗        ✗       ✓
GET /api/health                  ✓        ✓       ✓

Policy หมายถึงสิทธิ์ต้องกำหนดตาม Owner-based Authorization ของระบบ

26. สถาปัตยกรรมการทำงาน

Frontend
   │
   │ HttpOnly Cookie
   ↓
API Server
   │
   ├── AuthMiddleware
   │
   ├── RoleMiddleware
   │
   ├── RateLimiter
   │
   └── Routes
        │
        ├── Auth
        ├── Books
        ├── Authors
        ├── Chapters
        ├── Admin Users
        └── Dashboard
                │
                ↓
             Database

27. ข้อกำหนดสำคัญสำหรับ Admin Member Management

เพื่อให้ฟังก์ชัน:

กดระบบหลังบ้าน → เห็นสมาชิกจริงทันที

ต้องมีครบ:

1. GET /api/admin/users
2. AuthMiddleware
3. RoleMiddleware
4. Database Query
5. Frontend window.api.getUsers()
6. Admin Panel

การซ่อนปุ่ม Admin ไม่ใช่ Security เพียงพอ ต้องตรวจสิทธิ์ที่ Backend ด้วย

28. สถานะของ API Specification ฉบับนี้

ฉบับนี้เป็นการอัปเดตจาก API Specification เดิม โดยเพิ่มและจัดระบบ:

Authentication

AuthMiddleware

RoleMiddleware

RateLimiter

Book API

Author API

Chapter API

Word .docx Workflow

Admin Member Management

ค้นหาสมาชิก

กรองสมาชิก

Pagination

Dashboard Statistics

Health Check

Error Standard

Security Requirements

Permission Matrix
