import apiClient from '../lib/axios';
import type { LoginRequest, LoginResponse, GetMeResponse } from '../types/auth';

export const authService = {
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    const response = await apiClient.post<LoginResponse>('/auth/login', data);
    return response.data;
  },

  getMe: async (): Promise<GetMeResponse> => {
    const response = await apiClient.get<GetMeResponse>('/auth/me');
    return response.data;
  },
};
