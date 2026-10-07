import multer from 'multer';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// กำหนดโฟลเดอร์สำหรับเก็บไฟล์ที่อัปโหลด (ไว้นอกหรือใน root ของโปรเจกต์ตามความเหมาะสม)
export const UPLOAD_DIR = path.resolve(__dirname, '../../uploads');

// ตรวจสอบและสร้างโฟลเดอร์ uploads หากยังไม่มี
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// 1. ตั้งค่าพื้นที่จัดเก็บไฟล์ (Disk Storage)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    // 2. ป้องกันความปลอดภัย: ไม่ใช้ชื่อไฟล์เดิมจาก Client โดยตรง
    // สุ่มชื่อไฟล์ใหม่ด้วย UUID เพื่อป้องกัน Path Injection และการตั้งชื่อซ้ำ
    const uniqueSuffix = crypto.randomUUID();
    // ดึงเฉพาะนามสกุลไฟล์
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${uniqueSuffix}${ext}`);
  },
});

// 3. ป้องกันความปลอดภัย: ตรวจสอบ MIME Type อนุญาตเฉพาะไฟล์ภาพที่ปลอดภัย
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type! อนุญาตเฉพาะไฟล์ภาพ (.jpg, .jpeg, .png, .webp) เท่านั้น'), false);
  }
};

// 4. ตั้งค่า multer พร้อมจำกัดขนาดไฟล์ (ป้องกัน DoS จากการอัปโหลดไฟล์ขนาดใหญ่เกินไป)
export const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // จำกัดขนาดไฟล์สูงสุด 5MB
  },
});
