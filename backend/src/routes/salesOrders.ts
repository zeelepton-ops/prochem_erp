import { Router } from 'express';
import {
  createSalesOrder,
  getSalesOrder,
  getSalesOrders,
  updateSalesOrder,
  deleteSalesOrder,
} from '../controllers/SalesOrderController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.post('/', authorize('admin', 'manager'), createSalesOrder);
router.get('/', getSalesOrders);
router.get('/:id', getSalesOrder);
router.put('/:id', authorize('admin', 'manager'), updateSalesOrder);
router.delete('/:id', authorize('admin'), deleteSalesOrder);

export default router;
