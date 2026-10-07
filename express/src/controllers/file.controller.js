import path from 'path';
import fs from 'fs';
import { UPLOAD_DIR } from '../middlewares/upload.middleware.js';

/**
 * Controller สำหรับดึงไฟล์แบบปลอดภัย (Secure File Retrieval)
 * ป้องกันช่องโหว่ Path Traversal (Directory Traversal) และ File Inclusion
 */
export const getFile = (req, res) => {
  try {
    const rawFilename = req.params.filename;

    // 1. ป้องกัน Path Traversal ขั้นที่ 1: ตัด path นำหน้าออกให้เหลือเฉพาะชื่อไฟล์โดดๆ
    // ตัวอย่างเช่น "../../etc/passwd" จะถูกตัดเหลือแค่ "passwd"
    const safeFilename = path.basename(rawFilename);

    // 2. ป้องกัน Path Traversal ขั้นที่ 2: Resolve path แบบ absolute
    const targetFilePath = path.resolve(UPLOAD_DIR, safeFilename);

    // 3. ป้องกัน Path Traversal ขั้นที่ 3: ตรวจสอบว่า Path ผลลัพธ์ต้องอยู่ใต้โฟลเดอร์ UPLOAD_DIR เท่านั้น
    if (!targetFilePath.startsWith(UPLOAD_DIR)) {
      return res.status(403).json({ message: 'การเข้าถึงไฟล์ถูกปฏิเสธ (Access Denied)' });
    }

    // 4. ตรวจสอบว่ามีไฟล์อยู่จริงหรือไม่
    if (!fs.existsSync(targetFilePath)) {
      return res.status(404).json({ message: 'ไม่พบไฟล์ที่ระบุ (File Not Found)' });
    }

    // 5. ตั้งค่า Security Headers
    // nosniff: บังคับให้เบราว์เซอร์เชื่อ MIME type จากเซิร์ฟเวอร์ ไม่เดา mime type เอง (ป้องกัน XSS)
    res.setHeader('X-Content-Type-Options', 'nosniff');

    // 6. ส่งไฟล์ให้ Client
    return res.sendFile(targetFilePath);
  } catch (error) {
    return res.status(500).json({ message: 'เกิดข้อผิดพลาดในการดึงไฟล์', error: error.message });
  }
};
