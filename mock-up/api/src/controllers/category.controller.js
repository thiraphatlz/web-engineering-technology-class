import prisma from '../prisma.js';
import { ah, bad, removeFile } from '../utils/file.js';

const nameOf = (req) => {
  const name = req.body.name?.trim();
  if (!name) throw bad('กรุณากรอกชื่อหมวดหมู่');
  return name;
};

export const list = ah(async (req, res) => {
  res.json(await prisma.category.findMany({
    include: { _count: { select: { products: true } } }, // นับจำนวนสินค้าในหมวด
    orderBy: { id: 'desc' },
  }));
});

export const get = ah(async (req, res) => {
  res.json(await prisma.category.findUniqueOrThrow({
    where: { id: +req.params.id },
    include: { products: true },
  }));
});

export const create = ah(async (req, res) => {
  res.status(201).json(await prisma.category.create({ data: { name: nameOf(req) } }));
});

export const update = ah(async (req, res) => {
  res.json(await prisma.category.update({ where: { id: +req.params.id }, data: { name: nameOf(req) } }));
});

export const remove = ah(async (req, res) => {
  const id = +req.params.id;
  const products = await prisma.product.findMany({ where: { categoryId: id } });
  await prisma.category.delete({ where: { id } }); // cascade ลบ product ใน DB ให้
  products.forEach((p) => removeFile(p.imageUrl)); // ไฟล์บนดิสก์ DB ไม่รู้จัก ต้องลบเอง
  res.status(204).end();
});
