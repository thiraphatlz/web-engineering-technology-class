import multer from 'multer';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

export const UPLOAD_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../uploads');

export const upload = multer({
  storage: multer.diskStorage({
    destination: UPLOAD_DIR, // multer สร้างโฟลเดอร์ให้เองถ้ายังไม่มี
    // ห้ามใช้ชื่อไฟล์จากผู้ใช้ตรงๆ: สุ่มชื่อใหม่ กันชื่อซ้ำและ path injection
    filename: (req, file, cb) => cb(null, crypto.randomUUID() + path.extname(file.originalname).toLowerCase()),
  }),
  fileFilter: (req, file, cb) =>
    ['image/jpeg', 'image/png', 'image/webp'].includes(file.mimetype)
      ? cb(null, true)
      : cb(Object.assign(new Error('อนุญาตเฉพาะ jpg, png, webp'), { status: 400 })),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});
