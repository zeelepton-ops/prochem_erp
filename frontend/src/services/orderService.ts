import apiClient from './apiClient';
import type { PurchaseOrder, PaginatedResponse } from '../types';

export const purchaseOrderService = {
  async create(data: Partial<PurchaseOrder>): Promise<PurchaseOrder> {
    const response = await apiClient.instance.post('/purchase-orders', data);
    return response.data.data;
  },

  async getById(id: string): Promise<PurchaseOrder> {
    const response = await apiClient.instance.get(`/purchase-orders/${id}`);
    return response.data.data;
  },

  async getAll(page: number = 1, limit: number = 10, status?: string): Promise<PaginatedResponse<PurchaseOrder>> {
    const params = { page, limit, ...(status && { status }) };
    const response = await apiClient.instance.get('/purchase-orders', { params });
    return response.data.data;
  },

  async update(id: string, data: Partial<PurchaseOrder>): Promise<PurchaseOrder> {
    const response = await apiClient.instance.put(`/purchase-orders/${id}`, data);
    return response.data.data;
  },

  async delete(id: string): Promise<void> {
    await apiClient.instance.delete(`/purchase-orders/${id}`);
  },
};

export const salesOrderService = {
  async create(data: Partial<PurchaseOrder>): Promise<PurchaseOrder> {
    const response = await apiClient.instance.post('/sales-orders', data);
    return response.data.data;
  },

  async getById(id: string): Promise<PurchaseOrder> {
    const response = await apiClient.instance.get(`/sales-orders/${id}`);
    return response.data.data;
  },

  async getAll(page: number = 1, limit: number = 10): Promise<PaginatedResponse<PurchaseOrder>> {
    const response = await apiClient.instance.get('/sales-orders', {
      params: { page, limit },
    });
    return response.data.data;
  },

  async update(id: string, data: Partial<PurchaseOrder>): Promise<PurchaseOrder> {
    const response = await apiClient.instance.put(`/sales-orders/${id}`, data);
    return response.data.data;
  },

  async delete(id: string): Promise<void> {
    await apiClient.instance.delete(`/sales-orders/${id}`);
  },
};
