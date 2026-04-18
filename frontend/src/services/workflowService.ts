import apiClient from './apiClient';
import { MaterialTest, Production, DeliveryNote, PaginatedResponse } from '@types/index';

export const materialTestService = {
  async create(data: Partial<MaterialTest>): Promise<MaterialTest> {
    const response = await apiClient.instance.post('/material-tests', data);
    return response.data.data;
  },

  async getById(id: string): Promise<MaterialTest> {
    const response = await apiClient.instance.get(`/material-tests/${id}`);
    return response.data.data;
  },

  async getAll(page: number = 1, limit: number = 10): Promise<PaginatedResponse<MaterialTest>> {
    const response = await apiClient.instance.get('/material-tests', {
      params: { page, limit },
    });
    return response.data.data;
  },

  async update(id: string, data: Partial<MaterialTest>): Promise<MaterialTest> {
    const response = await apiClient.instance.put(`/material-tests/${id}`, data);
    return response.data.data;
  },

  async delete(id: string): Promise<void> {
    await apiClient.instance.delete(`/material-tests/${id}`);
  },
};

export const productionService = {
  async create(data: Partial<Production>): Promise<Production> {
    const response = await apiClient.instance.post('/production', data);
    return response.data.data;
  },

  async getById(id: string): Promise<Production> {
    const response = await apiClient.instance.get(`/production/${id}`);
    return response.data.data;
  },

  async getAll(page: number = 1, limit: number = 10, status?: string): Promise<PaginatedResponse<Production>> {
    const params = { page, limit, ...(status && { status }) };
    const response = await apiClient.instance.get('/production', { params });
    return response.data.data;
  },

  async update(id: string, data: Partial<Production>): Promise<Production> {
    const response = await apiClient.instance.put(`/production/${id}`, data);
    return response.data.data;
  },

  async delete(id: string): Promise<void> {
    await apiClient.instance.delete(`/production/${id}`);
  },
};

export const deliveryNoteService = {
  async create(data: Partial<DeliveryNote>): Promise<DeliveryNote> {
    const response = await apiClient.instance.post('/delivery-notes', data);
    return response.data.data;
  },

  async getById(id: string): Promise<DeliveryNote> {
    const response = await apiClient.instance.get(`/delivery-notes/${id}`);
    return response.data.data;
  },

  async getAll(page: number = 1, limit: number = 10): Promise<PaginatedResponse<DeliveryNote>> {
    const response = await apiClient.instance.get('/delivery-notes', {
      params: { page, limit },
    });
    return response.data.data;
  },

  async update(id: string, data: Partial<DeliveryNote>): Promise<DeliveryNote> {
    const response = await apiClient.instance.put(`/delivery-notes/${id}`, data);
    return response.data.data;
  },

  async delete(id: string): Promise<void> {
    await apiClient.instance.delete(`/delivery-notes/${id}`);
  },
};
