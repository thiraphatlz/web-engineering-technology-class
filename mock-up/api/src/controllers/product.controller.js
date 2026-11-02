import prisma from '../prisma.js';
import { ah, bad, removeFile } from '../utils/file.js';

export const list = ah(async (req, res) => {
  const { categoryId } = req.query; // /api/products?categoryId=2 กรองตามหมวด
  res.json(await prisma.product.findMany({
    where: categoryId ? { categoryId: +categoryId } : {},
    include: { category: true },
    orderBy: { id: 'desc' },
  }));
});

export const get = ah(async (req, res) => {
  res.json(await prisma.product.findUniqueOrThrow({
    where: { id: +req.params.id },
    include: { category: true },
  }));
});

export const create = ah(async (req, res) => {
  const { name, price, categoryId } = req.body; // ฟิลด์ข้อความมาจาก multer ที่ใส่ใน req.body
  if (!name || !price || !categoryId) throw bad('กรุณากรอก name, price, categoryId');
  res.status(201).json(await prisma.product.create({
    data: {
      name,
      price: +price,
      categoryId: +categoryId,
      imageUrl: req.file ? `/files/${req.file.filename}` : null,
    },
  }));
});

export const update = ah(async (req, res) => {
  const id = +req.params.id;
  const old = await prisma.product.findUniqueOrThrow({ where: { id } });
  const { name, price, categoryId } = req.body;
  const product = await prisma.product.update({
    where: { id },
    data: {
      ...(name && { name }),
      ...(price && { price: +price }),
      ...(categoryId && { categoryId: +categoryId }),
      ...(req.file && { imageUrl: `/files/${req.file.filename}` }), // ไม่ส่งไฟล์ = คงรูปเดิม
    },
  });
  if (req.file) removeFile(old.imageUrl); // อัปเดต DB สำเร็จแล้วค่อยลบรูปเก่า
  res.json(product);
});

export const remove = ah(async (req, res) => {
  const old = await prisma.product.findUniqueOrThrow({ where: { id: +req.params.id } });
  await prisma.product.delete({ where: { id: old.id } });
  removeFile(old.imageUrl);
  res.status(204).end();
});
