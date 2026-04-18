import { Router } from 'express';
import {
  getAvailableInventory,
  allocateInventoryFEFO,
  getAllocationDetails,
  getInventoryLotDetail,
  listInventoryLots,
  updateLotState,
  getStockSummary,
  getExpiryAlerts,
} from '../controllers/InventoryController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.use(authenticate);

// AVAILABLE INVENTORY
router.get('/available/:materialId', getAvailableInventory);
router.get('/summary', getStockSummary);
router.get('/alerts/expiry', getExpiryAlerts);

// INVENTORY LOTS
router.get('/lots', listInventoryLots);
router.get('/lot/:lotId', getInventoryLotDetail);
router.put('/lot/:lotId/state', authorize('admin', 'manager', 'qc'), updateLotState);

// FEFO ALLOCATION
router.post('/allocate-fefo', authorize('admin', 'manager', 'production'), allocateInventoryFEFO);
router.get('/allocation/:batchCardId', getAllocationDetails);

export default router;
