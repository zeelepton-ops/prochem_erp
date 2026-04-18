import { Router } from 'express';
import {
  createQCTest,
  getQCTest,
  listQCTests,
  approveQCTest,
  rejectQCTest,
  getIncomingQCGate,
  getOutgoingQCGate,
  getQCPendingItems,
  getQCReport,
} from '../controllers/QCController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.use(authenticate);

// QC TESTS
router.post('/', authorize('admin', 'manager', 'qc'), createQCTest);
router.get('/', listQCTests);
router.get('/:id', getQCTest);

// QC APPROVALS
router.put('/:id/approve', authorize('admin', 'manager', 'qc'), approveQCTest);
router.put('/:id/reject', authorize('admin', 'manager', 'qc'), rejectQCTest);

// QC GATES
router.get('/gate/incoming/:batchId', getIncomingQCGate);
router.get('/gate/outgoing/:fgBatchId', getOutgoingQCGate);
router.get('/pending-items', getQCPendingItems);

// QC REPORTS
router.get('/reports/summary', getQCReport);

export default router;
