import fs from 'fs';
import path from 'path';
import { UPLOAD_DIR } from '../middlewares/upload.js';

// basename ตัด ../ ออก จึงลบได้เฉพาะไฟล์ใน uploads; force = ไม่มีไฟล์ก็ไม่ error
export const removeFile = (url) => url && fs.rmSync(path.join(UPLOAD_DIR, path.basename(url)), { force: true });

// Express 4 ไม่จับ error ของ async เอง ใช้ตัวนี้แทนการเขียน try/catch ซ้ำทุก controller
export const ah = (fn) => (req, res, next) => fn(req, res, next).catch(next);

export const bad = (message) => Object.assign(new Error(message), { status: 400 });
