import { Router } from 'express';
import {
  createBatchCard,
  getBatchCard,
  listBatchCards,
  releaseBatchCard,
  startProduction,
  logMaterialConsumption,
  completeProduction,
  getProductionLogs,
  getProductionDashboard,
  getYieldAnalysis,
} from '../controllers/ProductionController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.use(authenticate);

// BATCH CARDS
router.post('/batch-card', authorize('admin', 'manager', 'production'), createBatchCard);
router.get('/batch-card', listBatchCards);
router.get('/batch-card/:id', getBatchCard);
router.put('/batch-card/:id/release', authorize('admin', 'manager', 'production'), releaseBatchCard);

// PRODUCTION EXECUTION
router.post('/start', authorize('admin', 'manager', 'production'), startProduction);
router.post('/consume', authorize('admin', 'production'), logMaterialConsumption);
router.put('/complete/:batchCardId', authorize('admin', 'manager', 'production'), completeProduction);

// PRODUCTION LOGS & ANALYTICS
router.get('/logs/:batchCardId', getProductionLogs);
router.get('/dashboard', getProductionDashboard);
router.get('/yield-analysis', getYieldAnalysis);

export default router;
