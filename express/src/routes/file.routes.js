import { Router } from 'express';
import { getFile } from '../controllers/file.controller.js';

const router = Router();

// Route สำหรับดึงไฟล์รูปภาพอย่างปลอดภัย
// GET /api/files/:filename
router.get('/:filename', getFile);

export default router;
