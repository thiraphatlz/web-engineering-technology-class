import { Router } from 'express';
import * as c from '../controllers/product.controller.js';
import { upload } from '../middlewares/upload.js';

export default Router()
  .get('/', c.list)
  .post('/', upload.single('image'), c.create)    // 'image' ต้องตรงกับ name="image" ใน <input type="file">
  .get('/:id', c.get)
  .put('/:id', upload.single('image'), c.update)
  .delete('/:id', c.remove);
