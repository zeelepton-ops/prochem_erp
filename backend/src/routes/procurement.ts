import { Router } from 'express';
import {
  createPurchaseOrder,
  getPurchaseOrder,
  listPurchaseOrders,
  updatePurchaseOrderStatus,
  logGoodsReceipt,
  getGoodsReceipt,
  listGoodsReceipts,
  getMaterialBatches,
  getMaterialBatch,
  getBatchTraceability,
} from '../controllers/ProcurementController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.use(authenticate);

// PURCHASE ORDERS
router.post('/', authorize('admin', 'manager'), createPurchaseOrder);
router.get('/', listPurchaseOrders);
router.get('/po/:id', getPurchaseOrder);
router.put('/:id/status', authorize('admin', 'manager'), updatePurchaseOrderStatus);

// GOODS RECEIPT NOTES (GRN)
router.post('/grn/log', authorize('admin', 'manager', 'warehouse'), logGoodsReceipt);
router.get('/grn/:id', getGoodsReceipt);
router.get('/grn', listGoodsReceipts);

// MATERIAL BATCHES
router.get('/batches', getMaterialBatches);
router.get('/batch/:id', getMaterialBatch);
router.get('/batch/:id/traceability', getBatchTraceability);

export default router;
