import { Request } from 'express';
import { ParsedQs } from 'qs';

export interface User {
  id: string;
  email: string;
  password?: string; // For input only
  password_hash?: string; // For database
  name?: string;
  firstName?: string; // For input only
  lastName?: string; // For input only
  role: 'admin' | 'manager' | 'operator' | 'viewer';
  department?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface JwtPayload {
  userId: string;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

export interface RequestWithUser extends Request<any, any, any, ParsedQs, Record<string, any>> {
  user?: JwtPayload;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginationQuery {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Domain Models
export interface PurchaseOrder {
  id: string;
  poNumber: string;
  supplierId: string;
  orderDate: Date;
  expectedDeliveryDate: Date;
  status: 'draft' | 'submitted' | 'confirmed' | 'received' | 'cancelled';
  totalAmount: number;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface RawMaterial {
  id: string;
  name: string;
  code: string;
  category: string;
  unit: string;
  specification: string;
  minStock: number;
  maxStock: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface MaterialTest {
  id: string;
  rawMaterialId: string;
  batchNumber: string;
  testDate: Date;
  testType: string;
  result: 'pass' | 'fail' | 'pending';
  remarks: string;
  testedBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface SalesOrder {
  id: string;
  soNumber: string;
  customerId: string;
  orderDate: Date;
  deliveryDate: Date;
  status: 'draft' | 'confirmed' | 'processing' | 'delivered' | 'cancelled';
  totalAmount: number;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface InventoryItem {
  id: string;
  rawMaterialId: string;
  quantity: number;
  location: string;
  lastCheckedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Production {
  id: string;
  batchNumber: string;
  productId: string;
  quantity: number;
  startDate: Date;
  endDate?: Date;
  status: 'planned' | 'in-progress' | 'completed' | 'rejected';
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductionModel extends Production {
  product_name?: string;
  created_by_name?: string;
}

export interface DeliveryNote {
  id: string;
  dnNumber: string;
  soId: string;
  deliveredBy: string;
  deliveredDate: Date;
  status: 'DELIVERED' | 'PENDING' | 'CANCELLED';
  items: DeliveryItem[];
  remarks: string;
  totalAmount: number;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface DeliveryItem {
  id: string;
  soItemId: string;
  productName: string;
  quantityDelivered: number;
  unitPrice: number;
  lineTotal: number;
  batchAllocations: BatchAllocation[];
}

export interface BatchAllocation {
  id: string;
  batchId: string;
  batchNumber: string;
  allocatedQuantity: number;
  expiryDate: string;
}
