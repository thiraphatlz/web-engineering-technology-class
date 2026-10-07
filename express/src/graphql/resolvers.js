import prisma from '../prisma.js';
import { removeFileSafely } from '../utils/file.js';
import { GraphQLError } from 'graphql';

/**
 * GraphQL Resolvers สำหรับจัดการตรรกะข้อมูลของ Book
 * ทำงานร่วมกับ Prisma ORM และสอดคล้องกับ REST API
 */
export const resolvers = {
  Query: {
    /**
     * ดึงรายการหนังสือทั้งหมด
     * เทียบเท่ากับ REST: GET /api/books
     */
    books: async () => {
      try {
        return await prisma.book.findMany({
          orderBy: { id: 'desc' },
        });
      } catch (error) {
        throw new GraphQLError(`ไม่สามารถดึงข้อมูลหนังสือได้: ${error.message}`, {
          extensions: { code: 'INTERNAL_SERVER_ERROR' },
        });
      }
    },

    /**
     * ดึงข้อมูลหนังสือทีละเล่มตาม ID
     * เทียบเท่ากับ REST: GET /api/books/:id
     */
    book: async (_, { id }) => {
      try {
        const book = await prisma.book.findUnique({
          where: { id },
        });

        if (!book) {
          throw new GraphQLError(`ไม่พบหนังสือที่มี ID: ${id}`, {
            extensions: { code: 'NOT_FOUND' },
          });
        }

        return book;
      } catch (error) {
        if (error instanceof GraphQLError) throw error;
        throw new GraphQLError(`เกิดข้อผิดพลาดในการค้นหาหนังสือ: ${error.message}`, {
          extensions: { code: 'INTERNAL_SERVER_ERROR' },
        });
      }
    },
  },

  Mutation: {
    /**
     * สร้างหนังสือใหม่
     * เทียบเท่ากับ REST: POST /api/books
     * ในระบบแบบ Hybrid: รูปภาพสามารถอัปโหลดผ่าน REST เพื่อรับ coverUrl แล้วส่งมาบันทึกที่นี่ได้
     */
    createBook: async (_, { input }) => {
      const { title, author, coverUrl } = input;

      if (!title || !author) {
        throw new GraphQLError('กรุณากรอก title และ author ให้ครบถ้วน', {
          extensions: { code: 'BAD_USER_INPUT' },
        });
      }

      try {
        return await prisma.book.create({
          data: {
            title,
            author,
            coverUrl: coverUrl || null,
          },
        });
      } catch (error) {
        throw new GraphQLError(`เกิดข้อผิดพลาดในการสร้างหนังสือ: ${error.message}`, {
          extensions: { code: 'INTERNAL_SERVER_ERROR' },
        });
      }
    },

    /**
     * แก้ไขข้อมูลหนังสือตาม ID
     * เทียบเท่ากับ REST: PUT /api/books/:id
     */
    updateBook: async (_, { id, input }) => {
      const { title, author, coverUrl } = input;

      // ตรวจสอบว่ามีหนังสือเล่มนี้อยู่หรือไม่
      const existingBook = await prisma.book.findUnique({
        where: { id },
      });

      if (!existingBook) {
        throw new GraphQLError(`ไม่พบหนังสือที่ต้องการแก้ไข ID: ${id}`, {
          extensions: { code: 'NOT_FOUND' },
        });
      }

      // หากมีการเปลี่ยน coverUrl ใหม่ ให้ลบไฟล์เก่าออกจากดิสก์อย่างปลอดภัย
      if (coverUrl !== undefined && coverUrl !== existingBook.coverUrl) {
        removeFileSafely(existingBook.coverUrl);
      }

      try {
        return await prisma.book.update({
          where: { id },
          data: {
            ...(title !== undefined && { title }),
            ...(author !== undefined && { author }),
            ...(coverUrl !== undefined && { coverUrl }),
          },
        });
      } catch (error) {
        throw new GraphQLError(`เกิดข้อผิดพลาดในการแก้ไขหนังสือ: ${error.message}`, {
          extensions: { code: 'INTERNAL_SERVER_ERROR' },
        });
      }
    },

    /**
     * เพิ่มรีวิวให้หนังสือ
     * เทียบเท่ากับ REST: POST /api/books/:id/reviews
     */
    addReview: async (_, { bookId, input }) => {
      const { rating, comment } = input;

      if (rating < 1 || rating > 5 || !comment) {
        throw new GraphQLError('rating ต้องเป็นจำนวนเต็ม 1-5 และต้องมี comment', {
          extensions: { code: 'BAD_USER_INPUT' },
        });
      }

      const book = await prisma.book.findUnique({ where: { id: bookId } });
      if (!book) {
        throw new GraphQLError(`ไม่พบหนังสือที่มี ID: ${bookId}`, {
          extensions: { code: 'NOT_FOUND' },
        });
      }

      try {
        return await prisma.review.create({ data: { bookId, rating, comment } });
      } catch (error) {
        throw new GraphQLError(`เกิดข้อผิดพลาดในการเพิ่มรีวิว: ${error.message}`, {
          extensions: { code: 'INTERNAL_SERVER_ERROR' },
        });
      }
    },

    /**
     * ลบหนังสือตาม ID พร้อมลบไฟล์รูปภาพปกออกจากระบบ
     * เทียบเท่ากับ REST: DELETE /api/books/:id
     */
    deleteBook: async (_, { id }) => {
      const existingBook = await prisma.book.findUnique({
        where: { id },
      });

      if (!existingBook) {
        throw new GraphQLError(`ไม่พบหนังสือที่ต้องการลบ ID: ${id}`, {
          extensions: { code: 'NOT_FOUND' },
        });
      }

      try {
        // ลบไฟล์รูปภาพออกจากดิสก์อย่างปลอดภัย
        removeFileSafely(existingBook.coverUrl);

        // ลบข้อมูลออกจากฐานข้อมูล
        await prisma.book.delete({
          where: { id },
        });

        return {
          success: true,
          message: `ลบหนังสือ ID: ${id} และไฟล์รูปภาพเรียบร้อยแล้ว`,
        };
      } catch (error) {
        throw new GraphQLError(`เกิดข้อผิดพลาดในการลบหนังสือ: ${error.message}`, {
          extensions: { code: 'INTERNAL_SERVER_ERROR' },
        });
      }
    },
  },

  // Field Resolvers สำหรับแปลง Date ให้เป็น String (ISO format) ถ้าจำเป็น
  Book: {
    reviews: (parent) => prisma.review.findMany({ where: { bookId: parent.id } }),
    publishedAt: (parent) => {
      return parent.publishedAt instanceof Date
        ? parent.publishedAt.toISOString()
        : new Date(parent.publishedAt).toISOString();
    },
  },
};
