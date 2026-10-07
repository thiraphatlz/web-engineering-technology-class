# Express.js - Book CRUD with RESTful & GraphQL Hybrid Architecture

โปรเจกต์ตัวอย่างการทำ CRUD ตาราง `Book` ด้วย Express, Apollo Server v4, Prisma (SQLite), และ Multer โดยรองรับทั้ง RESTful API และ GraphQL API พร้อมระบบรักษาความปลอดภัยของไฟล์

---

## ฟังก์ชันการทำงาน (Features)
1. **RESTful API**:
   - `POST /api/books` - สร้างหนังสือ พร้อมอัปโหลดไฟล์รูปภาพปก (`multipart/form-data`)
   - `GET /api/books` - ดึงรายชื่อหนังสือทั้งหมด
   - `GET /api/books/:id` - ดึงรายละเอียดหนังสือตาม ID
   - `PUT /api/books/:id` - แก้ไขข้อมูลหนังสือและอัปเดตรูปปกใหม่
   - `DELETE /api/books/:id` - ลบหนังสือ และลบไฟล์รูปภาพออกจากดิสก์
   - `GET /api/files/:filename` - ดึงไฟล์รูปภาพอย่างปลอดภัย (ป้องกัน Path Traversal, nosniff header)
2. **GraphQL API (`/graphql`)**:
   - Query: `books`, `book(id)`
   - Mutation: `createBook(input)`, `updateBook(id, input)`, `deleteBook(id)`
   - Interactive Sandbox GUI: เข้าผ่าน Browser ที่ `http://localhost:3000/graphql`

---

## จุดเด่นด้านความปลอดภัย (Security Features)
1. **ป้องกัน Path Traversal**: ตัด Path ด้วย `path.basename()` และตรวจเช็ก `path.resolve()` ให้อยู่ใต้ไดเรกทอรี `uploads/` เท่านั้น
2. **สุ่มชื่อไฟล์ด้วย UUID (`crypto.randomUUID()`)**: ป้องกัน Path Injection และชื่อไฟล์ซ้ำ
3. **ตรวจสอบ MIME Type**: อนุญาตเฉพาะ `image/jpeg`, `image/png`, `image/webp`
4. **จำกัดขนาดไฟล์**: สูงสุด 5MB ป้องกัน DoS
5. **ป้องกัน MIME Sniffing**: Header `X-Content-Type-Options: nosniff`
6. **ทำความสะอาดไฟล์**: ลบรูปเก่าเมื่อมีการแก้ไขหรือลบทั้งผ่าน REST และ GraphQL

---

## คำสั่งเริ่มต้นใช้งาน
```bash
npm install
npx prisma db push
npm run dev
```

Server จะทำงานที่ `http://localhost:3000`
- REST Books: `http://localhost:3000/api/books`
- REST Files: `http://localhost:3000/api/files/:filename`
- GraphQL API: `http://localhost:3000/graphql`
