import { v4 as uuid } from 'uuid';
import { User } from '../types';

// In-memory mock database
const mockDb = {
  users: new Map<string, User>(),
  purchaseOrders: new Map(),
  salesOrders: new Map(),
  materialTests: new Map(),
  production: new Map(),
  deliveryNotes: new Map(),
};

// Initialize with admin user
const adminId = uuid();
mockDb.users.set(adminId, {
  id: adminId,
  email: 'admin@bmm.local',
  firstName: 'System',
  lastName: 'Administrator',
  role: 'admin',
  department: 'Management',
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
});

// Add some demo password hash for admin@bmm.local with password admin123
// Hash: $2a$10$YIXgq8u5Xd2K8j6L9m0Kae8Eo1N7p0Q1r2S3t4U5v6W7x8Y9z0A0
mockDb.users.set('admin_password', {
  id: adminId,
  email: 'admin@bmm.local',
  firstName: 'System',
  lastName: 'Administrator',
  role: 'admin',
  department: 'Management',
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
});

export default mockDb;
