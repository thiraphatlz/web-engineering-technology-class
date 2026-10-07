import fs from 'fs';
import path from 'path';
import prisma from '../prisma.js';
import { UPLOAD_DIR } from '../middlewares/upload.middleware.js';
import { removeFileSafely } from '../utils/file.js';


/**
 * 1. Create - สร้างหนังสือใหม่ พร้อมอัปโหลดรูปปก (ถ้ามี)
 * POST /api/books
 */
export const createBook = async (req, res) => {
  try {
    const { title, author } = req.body;

    if (!title || !author) {
      // หากส่งข้อมูลไม่ครบแต่มีไฟล์อัปโหลดมาแล้ว ให้ลบทิ้งเพื่อไม่ให้ไฟล์ค้าง
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(400).json({ message: 'กรุณากรอก title และ author ให้ครบถ้วน' });
    }

    // หากมีการอัปโหลดไฟล์ ให้สร้าง URL สำหรับเข้าถึงไฟล์
    const coverUrl = req.file ? `/api/files/${req.file.filename}` : null;

    const newBook = await prisma.book.create({
      data: {
        title,
        author,
        coverUrl,
      },
    });

    return res.status(201).json({
      message: 'สร้างหนังสือสำเร็จ',
      data: newBook,
    });
  } catch (error) {
    // ลบไฟล์ที่อัปโหลดหากเกิด Error ในกระบวนการบันทึก Database
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    return res.status(500).json({ message: 'เกิดข้อผิดพลาดในการสร้างหนังสือ', error: error.message });
  }
};

/**
 * 2. Read All - ดึงข้อมูลหนังสือทั้งหมด
 * GET /api/books
 */
export const getBooks = async (req, res) => {
  try {
    const books = await prisma.book.findMany({
      orderBy: { id: 'desc' },
    });
    return res.status(200).json({
      message: 'ดึงข้อมูลหนังสือสำเร็จ',
      data: books,
    });
  } catch (error) {
    return res.status(500).json({ message: 'เกิดข้อผิดพลาดในการดึงข้อมูล', error: error.message });
  }
};

/**
 * 3. Read One - ดึงข้อมูลหนังสือรายเล่มตาม ID
 * GET /api/books/:id
 */
export const getBookById = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ message: 'ID ต้องเป็นตัวเลขเท่านั้น' });
    }

    const book = await prisma.book.findUnique({
      where: { id },
    });

    if (!book) {
      return res.status(404).json({ message: 'ไม่พบหนังสือที่ระบุ' });
    }

    return res.status(200).json({
      message: 'ดึงข้อมูลหนังสือสำเร็จ',
      data: book,
    });
  } catch (error) {
    return res.status(500).json({ message: 'เกิดข้อผิดพลาดในการดึงข้อมูล', error: error.message });
  }
};

/**
 * 4. Update - แก้ไขข้อมูลหนังสือ (และเปลี่ยนรูปปกถ้ามีการอัปโหลดใหม่)
 * PUT /api/books/:id
 */
export const updateBook = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ message: 'ID ต้องเป็นตัวเลขเท่านั้น' });
    }

    // ตรวจสอบว่ามีหนังสือเล่มนี้อยู่หรือไม่
    const existingBook = await prisma.book.findUnique({
      where: { id },
    });

    if (!existingBook) {
      if (req.file) fs.unlinkSync(req.file.path);
      return res.status(404).json({ message: 'ไม่พบหนังสือที่ต้องการแก้ไข' });
    }

    const { title, author } = req.body;
    let coverUrl = existingBook.coverUrl;

    // ถ้ามีการอัปโหลดรูปใหม่เข้ามา
    if (req.file) {
      // 1. ลบรูปเดิมออกจาก Disk เพื่อไม่ให้เปลืองพื้นที่
      removeFileSafely(existingBook.coverUrl);
      // 2. กำหนด coverUrl ใหม่
      coverUrl = `/api/files/${req.file.filename}`;
    }

    const updatedBook = await prisma.book.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(author && { author }),
        coverUrl,
      },
    });

    return res.status(200).json({
      message: 'แก้ไขข้อมูลหนังสือสำเร็จ',
      data: updatedBook,
    });
  } catch (error) {
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    return res.status(500).json({ message: 'เกิดข้อผิดพลาดในการแก้ไขข้อมูล', error: error.message });
  }
};

/**
 * 6. Create Review - เพิ่มรีวิวให้หนังสือเล่มที่ระบุ
 * POST /api/books/:id/reviews
 */
export const createReview = async (req, res) => {
  try {
    const bookId = parseInt(req.params.id, 10);
    if (isNaN(bookId)) {
      return res.status(400).json({ message: 'ID ต้องเป็นตัวเลขเท่านั้น' });
    }

    const { comment } = req.body;
    const rating = Number(req.body.rating);
    if (!Number.isInteger(rating) || rating < 1 || rating > 5 || !comment) {
      return res.status(400).json({ message: 'rating ต้องเป็นจำนวนเต็ม 1-5 และต้องมี comment' });
    }

    const book = await prisma.book.findUnique({ where: { id: bookId } });
    if (!book) {
      return res.status(404).json({ message: 'ไม่พบหนังสือที่ระบุ' });
    }

    const review = await prisma.review.create({
      data: { bookId, rating, comment },
    });

    return res.status(201).json({ message: 'เพิ่มรีวิวสำเร็จ', data: review });
  } catch (error) {
    return res.status(500).json({ message: 'เกิดข้อผิดพลาดในการเพิ่มรีวิว', error: error.message });
  }
};

/**
 * 5. Delete - ลบหนังสือ และลบไฟล์รูปปกที่ผูกอยู่ออกจากระบบ
 * DELETE /api/books/:id
 */
export const deleteBook = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ message: 'ID ต้องเป็นตัวเลขเท่านั้น' });
    }

    const existingBook = await prisma.book.findUnique({
      where: { id },
    });

    if (!existingBook) {
      return res.status(404).json({ message: 'ไม่พบหนังสือที่ต้องการลบ' });
    }

    // 1. ลบรูปปกออกจากดิสก์ก่อน
    removeFileSafely(existingBook.coverUrl);

    // 2. ลบรายการออกจากฐานข้อมูล
    await prisma.book.delete({
      where: { id },
    });

    return res.status(200).json({
      message: 'ลบหนังสือและรูปปกสำเร็จ',
    });
  } catch (error) {
    return res.status(500).json({ message: 'เกิดข้อผิดพลาดในการลบข้อมูล', error: error.message });
  }
};
