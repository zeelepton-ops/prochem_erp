export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'manager' | 'operator' | 'viewer';
  department: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthResponse {
  user: User;
  token: string;
}

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

export interface DeliveryNote {
  id: string;
  salesOrderId: string;
  deliveryDate: Date;
  status: 'pending' | 'in-transit' | 'delivered' | 'cancelled';
  carrier: string;
  trackingNumber?: string;
  notes: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
