import { Router } from 'express';
import {
  getBatchTraceability,
  getProductTraceability,
  getSupplierQualityReport,
  getProductionEfficiencyReport,
  getInventoryTurnoverReport,
  getBatchConsumptionReport,
  getMaterialGenealogyReport,
  getComplianceReport,
  getExpiryRiskReport,
  getAuditTrail,
  getDashboardMetrics,
} from '../controllers/ReportsController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.use(authenticate);

// TRACEABILITY REPORTS
router.get('/traceability/batch/:batchId', getBatchTraceability);
router.get('/traceability/product/:productBatchId', getProductTraceability);
router.get('/traceability/genealogy/:materialBatchId', getMaterialGenealogyReport);

// CONSUMPTION & ALLOCATIONS
router.get('/consumption/batch/:batchCardId', getBatchConsumptionReport);

// QUALITY REPORTS
router.get('/quality/supplier/:supplierId', getSupplierQualityReport);

// PRODUCTION REPORTS
router.get('/production/efficiency', getProductionEfficiencyReport);

// INVENTORY REPORTS
router.get('/inventory/turnover', getInventoryTurnoverReport);

// COMPLIANCE & AUDITS
router.get('/compliance', authorize('admin', 'manager', 'qc'), getComplianceReport);
router.get('/audit/:entityType/:entityId', authorize('admin', 'manager'), getAuditTrail);

// RISK REPORTS
router.get('/risk/expiry', getExpiryRiskReport);

// DASHBOARD
router.get('/dashboard/metrics', getDashboardMetrics);

export default router;
