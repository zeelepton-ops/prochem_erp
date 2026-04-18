import { Router } from 'express';
import {
  createMaterialTest,
  getMaterialTest,
  getMaterialTests,
  updateMaterialTest,
  deleteMaterialTest,
} from '../controllers/MaterialTestController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.post('/', authorize('admin', 'manager', 'operator'), createMaterialTest);
router.get('/', getMaterialTests);
router.get('/:id', getMaterialTest);
router.put('/:id', authorize('admin', 'manager', 'operator'), updateMaterialTest);
router.delete('/:id', authorize('admin'), deleteMaterialTest);

export default router;
