import apiClient from './apiClient';
import { AuthResponse, User } from '@types/index';

export const authService = {
  async login(email: string, password: string): Promise<AuthResponse> {
    const { data } = await apiClient.instance.post('/auth/login', {
      email,
      password,
    });
    if (data.data?.token) {
      apiClient.setToken(data.data.token);
    }
    return data.data;
  },

  async register(
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    department?: string
  ): Promise<AuthResponse> {
    const { data } = await apiClient.instance.post('/auth/register', {
      email,
      password,
      firstName,
      lastName,
      department,
    });
    if (data.data?.token) {
      apiClient.setToken(data.data.token);
    }
    return data.data;
  },

  async getProfile(): Promise<User> {
    const { data } = await apiClient.instance.get('/auth/profile');
    return data.data;
  },

  logout(): void {
    apiClient.clearToken();
  },

  isAuthenticated(): boolean {
    return apiClient.isAuthenticated();
  },
};
