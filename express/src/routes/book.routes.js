import { Router } from 'express';
import {
  createBook,
  getBooks,
  getBookById,
  updateBook,
  deleteBook,
  createReview,
} from '../controllers/book.controller.js';
import { upload } from '../middlewares/upload.middleware.js';

const router = Router();

// Endpoint สำหรับการสร้างหนังสือ พร้อม middleware multer รับฟิลด์ 'cover' (single file)
router.post('/', upload.single('cover'), createBook);

// Endpoint สำหรับการอ่านข้อมูลหนังสือทั้งหมด
router.get('/', getBooks);

// Endpoint สำหรับการอ่านข้อมูลหนังสือทีละเล่มตาม ID
router.get('/:id', getBookById);

// Endpoint สำหรับการแก้ไขข้อมูลหนังสือ พร้อม middleware multer รับฟิลด์ 'cover'
router.put('/:id', upload.single('cover'), updateBook);

// Endpoint สำหรับการลบข้อมูลหนังสือ
router.delete('/:id', deleteBook);

// Endpoint สำหรับเพิ่มรีวิวให้หนังสือ (JSON body: rating 1-5, comment)
router.post('/:id/reviews', createReview);

export default router;
