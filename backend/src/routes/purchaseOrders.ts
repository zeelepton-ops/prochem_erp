import { Router } from 'express';
import {
  createPurchaseOrder,
  getPurchaseOrder,
  getPurchaseOrders,
  updatePurchaseOrder,
  deletePurchaseOrder,
} from '../controllers/PurchaseOrderController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.post('/', authorize('admin', 'manager'), createPurchaseOrder);
router.get('/', getPurchaseOrders);
router.get('/:id', getPurchaseOrder);
router.put('/:id', authorize('admin', 'manager'), updatePurchaseOrder);
router.delete('/:id', authorize('admin'), deletePurchaseOrder);

export default router;
