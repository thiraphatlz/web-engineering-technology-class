import { Router } from 'express';
import * as c from '../controllers/category.controller.js';

export default Router()
  .get('/', c.list)
  .post('/', c.create)
  .get('/:id', c.get)
  .put('/:id', c.update)
  .delete('/:id', c.remove);
