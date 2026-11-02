import express from 'express';
import cors from 'cors';
import fs from 'fs';
import YAML from 'yaml';
import swaggerUi from 'swagger-ui-express';
import categoryRoutes from './routes/category.routes.js';
import productRoutes from './routes/product.routes.js';
import { UPLOAD_DIR } from './middlewares/upload.js';
import { removeFile } from './utils/file.js';

const app = express();
app.use(cors()); // อนุญาตให้ Next (3001) เรียก Express (3000) ข้ามพอร์ตได้
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Swagger UI ที่ /docs อ่านสเปกจาก api/openapi.yaml
const spec = YAML.parse(fs.readFileSync(new URL('../openapi.yaml', import.meta.url), 'utf8'));
app.use('/docs', swaggerUi.serve, swaggerUi.setup(spec));
app.get('/openapi.json', (req, res) => res.json(spec));

// เสิร์ฟรูป: express.static กัน path traversal ให้อยู่แล้ว
app.use('/files', express.static(UPLOAD_DIR, { setHeaders: (res) => res.setHeader('X-Content-Type-Options', 'nosniff') }));
app.use('/api/categories', categoryRoutes);
app.use('/api/products', productRoutes);

// ที่จัดการ error ที่เดียว (ต้องอยู่หลัง route ทั้งหมด และมี 4 พารามิเตอร์)
const KNOWN = {
  P2025: [404, 'ไม่พบข้อมูล'],
  P2002: [409, 'ข้อมูลซ้ำ'],
  P2003: [400, 'ไม่พบหมวดหมู่ที่อ้างอิง'],
  LIMIT_FILE_SIZE: [400, 'ไฟล์ใหญ่เกิน 5MB'],
};
app.use((err, req, res, next) => {
  if (req.file) removeFile(req.file.filename); // request พัง = ลบไฟล์ที่เพิ่งอัปโหลดทิ้ง ไม่ให้ค้าง
  const [status, message] = KNOWN[err.code] ?? [err.status ?? 500, err.message];
  res.status(status).json({ message });
});

app.listen(3000, () => console.log('API on http://localhost:3000'));
