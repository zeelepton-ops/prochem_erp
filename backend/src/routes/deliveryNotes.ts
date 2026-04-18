import { Router } from 'express';
import {
  createDeliveryNote,
  getDeliveryNote,
  getDeliveryNotes,
  updateDeliveryNote,
  deleteDeliveryNote,
} from '../controllers/DeliveryNoteController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.post('/', authorize('admin', 'manager'), createDeliveryNote);
router.get('/', getDeliveryNotes);
router.get('/:id', getDeliveryNote);
router.put('/:id', authorize('admin', 'manager'), updateDeliveryNote);
router.delete('/:id', authorize('admin'), deleteDeliveryNote);

export default router;
