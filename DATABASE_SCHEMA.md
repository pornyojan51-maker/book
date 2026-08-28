# Database Schema Design (Cloudflare D1)

## 1. Tables
- *Users*
  - UserID (UUID, Primary Key)
  - Username (TEXT, Unique)
  - PasswordHash (TEXT)
  - Email (TEXT, Unique)
  - Role (TEXT: 'ADMIN', 'MEMBER')
  - Status (TEXT: 'ACTIVE', 'BANNED')
  - CreatedDate (DATETIME)

- *Books*
  - BookID (UUID, PK)
  - BookName (TEXT)
  - Author (TEXT)
  - CategoryID (INTEGER, FK)
  - Description (TEXT)
  - CoverImageURL (TEXT, Link to R2)
  - FilePathURL (TEXT, Link to R2)
  - Status (TEXT: 'DRAFT', 'PUBLISHED')
  - ViewCount (INTEGER)

- *Categories*
  - CategoryID (INTEGER, PK)
  - CategoryName (TEXT)

- *ReadingHistory*
  - HistoryID (UUID, PK)
  - UserID (UUID, FK)
  - BookID (UUID, FK)
  - ReadDate (DATETIME)

- *LoginLogs*
  - LogID (UUID, PK)
  - UserID (UUID, FK)
  - LoginTime (DATETIME)
  - IPAddress (TEXT)
