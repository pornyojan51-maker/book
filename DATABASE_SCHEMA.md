Database Schema Design (Cloudflare D1)

1. Overview

Database schema สำหรับระบบ Lumina Books โดยใช้ Cloudflare D1 เป็นฐานข้อมูลเชิงสัมพันธ์

โครงสร้างหลักประกอบด้วย:

Users
 ├── ReadingHistory
 └── LoginLogs

Books
 ├── Categories
 └── ReadingHistory

2. Tables

2.1 Users

ใช้จัดเก็บข้อมูลสมาชิกและผู้ดูแลระบบ

Field

Type

Constraint

Description

UserID

UUID

Primary Key

รหัสผู้ใช้

Username

TEXT

Unique

ชื่อผู้ใช้

PasswordHash

TEXT



รหัสผ่านที่ผ่านการ Hash

Email

TEXT

Unique

อีเมล

Role

TEXT

ADMIN, MEMBER

ระดับสิทธิ์

Status

TEXT

ACTIVE, BANNED

สถานะบัญชี

CreatedDate

DATETIME



วันที่สร้างบัญชี

Role

ADMIN
MEMBER

Status

ACTIVE
BANNED

2.2 Books

ใช้จัดเก็บข้อมูลหนังสือ

Field

Type

Constraint

Description

BookID

UUID

Primary Key

รหัสหนังสือ

BookName

TEXT



ชื่อหนังสือ

Author

TEXT



ผู้แต่ง

CategoryID

INTEGER

Foreign Key

หมวดหมู่

Description

TEXT



รายละเอียด

CoverImageURL

TEXT



ลิงก์ภาพปกใน R2

FilePathURL

TEXT



ลิงก์ไฟล์หนังสือใน R2

Status

TEXT

DRAFT, PUBLISHED

สถานะหนังสือ

ViewCount

INTEGER



จำนวนครั้งที่เปิดอ่าน

Status

DRAFT
PUBLISHED

2.3 Categories

ใช้จัดเก็บหมวดหมู่หนังสือ

Field

Type

Constraint

Description

CategoryID

INTEGER

Primary Key

รหัสหมวดหมู่

CategoryName

TEXT



ชื่อหมวดหมู่

2.4 ReadingHistory

ใช้จัดเก็บประวัติการอ่านหนังสือของสมาชิก

Field

Type

Constraint

Description

HistoryID

UUID

Primary Key

รหัสประวัติ

UserID

UUID

Foreign Key

รหัสผู้ใช้

BookID

UUID

Foreign Key

รหัสหนังสือ

ReadDate

DATETIME



วันที่อ่าน

ความสัมพันธ์:

Users.UserID
      │
      └──────< ReadingHistory.UserID

Books.BookID
      │
      └──────< ReadingHistory.BookID

2.5 LoginLogs

ใช้จัดเก็บประวัติการเข้าสู่ระบบ

Field

Type

Constraint

Description

LogID

UUID

Primary Key

รหัส Log

UserID

UUID

Foreign Key

รหัสผู้ใช้

LoginTime

DATETIME



เวลาเข้าสู่ระบบ

IPAddress

TEXT



IP Address

ความสัมพันธ์:

Users.UserID
      │
      └──────< LoginLogs.UserID

3. Entity Relationship

┌──────────────────────┐
│        Users         │
├──────────────────────┤
│ UserID PK            │
│ Username UNIQUE      │
│ PasswordHash         │
│ Email UNIQUE         │
│ Role                 │
│ Status               │
│ CreatedDate          │
└─────────┬────────────┘
          │
          │ 1:N
          ├───────────────────────┐
          │                       │
          ▼                       ▼
┌──────────────────────┐  ┌──────────────────────┐
│   ReadingHistory     │  │      LoginLogs       │
├──────────────────────┤  ├──────────────────────┤
│ HistoryID PK         │  │ LogID PK             │
│ UserID FK            │  │ UserID FK            │
│ BookID FK            │  │ LoginTime            │
│ ReadDate             │  │ IPAddress            │
└──────────┬───────────┘  └──────────────────────┘
           │
           │ N:1
           ▼
┌──────────────────────┐
│        Books         │
├──────────────────────┤
│ BookID PK            │
│ BookName             │
│ Author               │
│ CategoryID FK        │
│ Description          │
│ CoverImageURL        │
│ FilePathURL          │
│ Status               │
│ ViewCount            │
└──────────┬───────────┘
           │
           │ N:1
           ▼
┌──────────────────────┐
│      Categories      │
├──────────────────────┤
│ CategoryID PK        │
│ CategoryName         │
└──────────────────────┘

4. Relationships

Users → ReadingHistory

Users.UserID
    ↓
ReadingHistory.UserID

ความสัมพันธ์:

1 User : Many ReadingHistory

สมาชิกหนึ่งคนสามารถมีประวัติการอ่านได้หลายรายการ

Books → ReadingHistory

Books.BookID
    ↓
ReadingHistory.BookID

ความสัมพันธ์:

1 Book : Many ReadingHistory

หนังสือหนึ่งเล่มสามารถปรากฏในประวัติการอ่านของสมาชิกหลายรายการ

Categories → Books

Categories.CategoryID
    ↓
Books.CategoryID

ความสัมพันธ์:

1 Category : Many Books

หมวดหมู่หนึ่งสามารถมีหนังสือหลายเล่ม

Users → LoginLogs

Users.UserID
    ↓
LoginLogs.UserID

ความสัมพันธ์:

1 User : Many LoginLogs

ผู้ใช้หนึ่งคนสามารถมี Login Log หลายรายการ

5. Primary Keys

Table

Primary Key

Users

UserID

Books

BookID

Categories

CategoryID

ReadingHistory

HistoryID

LoginLogs

LogID

Primary Key ต้องสามารถระบุข้อมูลแต่ละแถวได้อย่างไม่ซ้ำกัน

6. Foreign Keys

Table

Foreign Key

References

Books

CategoryID

Categories.CategoryID

ReadingHistory

UserID

Users.UserID

ReadingHistory

BookID

Books.BookID

LoginLogs

UserID

Users.UserID

7. Database Security

ข้อมูลรหัสผ่านต้องจัดเก็บในรูปแบบ:

Password
   ↓
Password Hashing
   ↓
PasswordHash
   ↓
Database

ห้ามจัดเก็บรหัสผ่านแบบ Plain Text

ข้อมูลสำคัญของระบบ เช่น Database credential และ Secret ไม่ควรอยู่ใน Frontend

8. Cloudflare R2

ตาราง Books เก็บ URL สำหรับไฟล์ที่จัดเก็บใน R2:

CoverImageURL
FilePathURL

โครงสร้างการทำงาน:

Frontend
   │
   ▼
API Server
   │
   ├── Cloudflare D1
   │     └── Metadata
   │
   └── Cloudflare R2
         ├── Cover Image
         └── Book File

9. Book Status

หนังสือมีสถานะ:

DRAFT
PUBLISHED

ตัวอย่าง Workflow:

สร้างหนังสือ
     ↓
DRAFT
     ↓
ตรวจสอบข้อมูล
     ↓
PUBLISHED
     ↓
แสดงในคลังหนังสือ

10. User Status

สมาชิกมีสถานะ:

ACTIVE
BANNED

ตัวอย่าง:

ACTIVE
  ↓
สามารถเข้าสู่ระบบตาม Policy

BANNED
  ↓
ไม่อนุญาตให้เข้าสู่ระบบตาม Policy

11. Admin Member Management

ระบบหลังบ้านสามารถใช้ตาราง Users เป็นแหล่งข้อมูลสมาชิกจริง

Workflow:

Admin Login
    ↓
AuthMiddleware
    ↓
ตรวจ Role
    ↓
ADMIN
    ↓
GET /api/admin/users
    ↓
Query Users
    ↓
แสดงสมาชิกจริง

ข้อมูลที่เหมาะสำหรับส่งให้หน้า Admin:

UserID
Username
Email
Role
Status
CreatedDate

ไม่ควรส่ง:

PasswordHash
Password
Authentication Token
Secret
Database Credential

12. การเชื่อมโยงกับ API

Database นี้รองรับ API ที่ระบุไว้ในระบบ Lumina Books เช่น:

POST /api/auth/register
POST /api/auth/login
POST /api/auth/logout
GET  /api/auth/me

GET  /api/books
GET  /api/books/:id
POST /api/books
PUT  /api/books/:id
DELETE /api/books/:id

GET /api/admin/users
GET /api/admin/users/:id

GET /api/dashboard/stats

13. ข้อสังเกตเกี่ยวกับระบบแยกตอน

Schema ที่ให้มานี้ประกอบด้วย 5 ตาราง:

Users
Books
Categories
ReadingHistory
LoginLogs

ยังไม่มีตาราง Chapters ใน Schema นี้

ดังนั้น หากต้องการให้ระบบหนังสือรองรับ:

หนังสือ
 ├── ตอนที่ 1
 ├── ตอนที่ 2
 ├── ตอนที่ 3
 └── ตอนที่ 4

จำเป็นต้องเพิ่มตาราง Chapters ใน Database Schema ก่อนจึงจะสามารถจัดเก็บแต่ละตอนเป็นข้อมูลแยกจากกันใน D1 ได้

ตัวอย่างโครงสร้างที่ควรเพิ่มภายหลัง:

Chapters
├── ChapterID
├── BookID
├── ChapterNumber
├── ChapterTitle
├── Content
├── SourceFileURL
└── CreatedDate

ความสัมพันธ์:

Books
  │
  │ 1:N
  ▼
Chapters

ส่วนนี้ ไม่ได้อยู่ใน Schema ที่ผู้ใช้ให้มาเดิม จึงแยกไว้เป็นข้อเสนอสำหรับการรองรับระบบแยกตอน ไม่ได้ถือว่าเป็นตารางที่มีอยู่แล้ว

14. สรุป Schema ปัจจุบัน

Users
 ├── UserID (PK)
 ├── Username
 ├── PasswordHash
 ├── Email
 ├── Role
 ├── Status
 └── CreatedDate

Books
 ├── BookID (PK)
 ├── BookName
 ├── Author
 ├── CategoryID (FK)
 ├── Description
 ├── CoverImageURL
 ├── FilePathURL
 ├── Status
 └── ViewCount

Categories
 ├── CategoryID (PK)
 └── CategoryName

ReadingHistory
 ├── HistoryID (PK)
 ├── UserID (FK)
 ├── BookID (FK)
 └── ReadDate

LoginLogs
 ├── LogID (PK)
 ├── UserID (FK)
 ├── LoginTime
 └── IPAddress
