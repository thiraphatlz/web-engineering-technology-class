/**
 * GraphQL Type Definitions (Schema) สำหรับระบบจัดการหนังสือ (Book Management)
 * กำหนดโครงสร้างข้อมูล Types, Queries, และ Mutations
 */
export const typeDefs = `#graphql
  # โมเดลข้อมูลหนังสือ (ตรงกับ Prisma Model Book)
  type Book {
    id: Int!
    title: String!
    author: String!
    publishedAt: String!
    coverUrl: String
    reviews: [Review!]!
  }

  # รีวิวของหนังสือ (ตรงกับ Prisma Model Review)
  type Review {
    id: Int!
    rating: Int!
    comment: String!
    bookId: Int!
  }

  input AddReviewInput {
    rating: Int!
    comment: String!
  }

  # ข้อมูลนำเข้าสำหรับการสร้างหนังสือใหม่
  input CreateBookInput {
    title: String!
    author: String!
    coverUrl: String
  }

  # ข้อมูลนำเข้าสำหรับการแก้ไขข้อมูลหนังสือ
  input UpdateBookInput {
    title: String
    author: String
    coverUrl: String
  }

  # ผลลัพธ์จากการลบข้อมูล
  type DeleteBookResponse {
    success: Boolean!
    message: String!
  }

  # คำสั่งดึงข้อมูล (Read Queries)
  type Query {
    # ดึงรายการหนังสือทั้งหมด (เรียงจากใหม่ไปเก่า)
    books: [Book!]!

    # ดึงข้อมูลหนังสือเล่มเดียวตาม ID
    book(id: Int!): Book
  }

  # คำสั่งแก้ไข/สร้าง/ลบข้อมูล (Write Mutations)
  type Mutation {
    # สร้างหนังสือใหม่
    createBook(input: CreateBookInput!): Book!

    # แก้ไขข้อมูลหนังสือตาม ID
    updateBook(id: Int!, input: UpdateBookInput!): Book!

    # เพิ่มรีวิวให้หนังสือตาม ID
    addReview(bookId: Int!, input: AddReviewInput!): Review!

    # ลบหนังสือตาม ID พร้อมจัดการลบไฟล์รูปภาพออกจากดิสก์
    deleteBook(id: Int!): DeleteBookResponse!
  }
`;
