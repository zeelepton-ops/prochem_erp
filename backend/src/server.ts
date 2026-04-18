import express, { Express, Request, Response } from 'express';
import morgan from 'morgan';
import helmet from 'helmet';
import cors from 'cors';

import { config } from './config/env';
import { corsMiddleware } from './middleware/cors';
import { errorHandler, asyncHandler } from './middleware/errorHandler';

import authRoutes from './routes/auth';
import procurementRoutes from './routes/procurement';
import purchaseOrderRoutes from './routes/purchaseOrders';
import inventoryRoutes from './routes/inventory';
import productionRoutes from './routes/production';
import qcRoutes from './routes/qc';
import reportsRoutes from './routes/reports';
import deliveryNoteRoutes from './routes/deliveryNotes';
import salesOrderRoutes from './routes/salesOrders';
import materialTestRoutes from './routes/materialTests';
import auditLogsRoutes from './routes/auditLogs';
import masterDataRoutes from './routes/masterDataRoutes';

const app: Express = express();

// Middleware
app.use(helmet());
app.use(corsMiddleware);
app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/procurement', procurementRoutes);
app.use('/api/purchase-orders', purchaseOrderRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/production', productionRoutes);
app.use('/api/qc', qcRoutes);
app.use('/api/material-tests', materialTestRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/delivery-notes', deliveryNoteRoutes);
app.use('/api/sales-orders', salesOrderRoutes);
app.use('/api/audit-logs', auditLogsRoutes);
app.use('/api', masterDataRoutes);

// 404 Handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
    path: req.path,
  });
});

// Error Handler
app.use(errorHandler);

const PORT = config.port;

app.listen(PORT, () => {
  const dbHost = process.env.DB_HOST || 'localhost';
  console.log(`✅ Server is running on http://localhost:${PORT}`);
  console.log(`📊 Database: ${dbHost}`);
  console.log(`📚 API Documentation: http://localhost:${PORT}/api`);
  console.log(`🏥 Health Check: http://localhost:${PORT}/health`);
  
  if (process.env.FALLBACK_TO_MOCK === 'true') {
    console.log(`\n⚙️  Fallback to mock mode enabled`);
    console.log(`📝 If Supabase connects, real database will be used automatically\n`);
  }
});

export default app;
