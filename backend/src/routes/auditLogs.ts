import { Router } from 'express';
import { getAuditLogs, getAuditLogsByEntity, getAuditLogReport } from '../controllers/AuditLogsController';
import { authenticate } from '../middleware/auth';

const router = Router();

// Get all audit logs with optional filters
router.get('/', authenticate, getAuditLogs);

// Get audit logs for a specific entity
router.get('/entity/:entityId', authenticate, getAuditLogsByEntity);

// Get audit log summary report
router.get('/report/summary', authenticate, getAuditLogReport);

export default router;
