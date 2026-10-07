import fs from 'fs';
import path from 'path';
import { UPLOAD_DIR } from '../middlewares/upload.middleware.js';

/**
 * ฟังก์ชันช่วยลบไฟล์ออกจาก Disk อย่างปลอดภัย
 * ป้องกัน Path Traversal ก่อนลบไฟล์เสมอ
 *
 * @param {string | null} fileUrl - เส้นทางไฟล์ เช่น "/api/files/uuid.jpg"
 */
export const removeFileSafely = (fileUrl) => {
  if (!fileUrl) return;
  try {
    const filename = path.basename(fileUrl);
    const filePath = path.resolve(UPLOAD_DIR, filename);

    // ตรวจสอบว่าไฟล์อยู่ภายใต้โฟลเดอร์ UPLOAD_DIR จริงๆ ก่อนลบ
    if (filePath.startsWith(UPLOAD_DIR) && fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (err) {
    console.error('ไม่สามารถลบไฟล์เก่าได้:', err.message);
  }
};
