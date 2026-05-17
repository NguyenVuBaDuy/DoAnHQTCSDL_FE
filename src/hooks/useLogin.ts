import { useMutation } from '@tanstack/react-query';
import { authService } from '../services/authService';
import type { LoginRequest, LoginResponse, LoginError } from '../types/auth';

export function useLogin() {
  return useMutation<LoginResponse, LoginError, LoginRequest>({
    mutationFn: authService.login,
    onSuccess: (data) => {
      // Lưu token vào localStorage
      localStorage.setItem('accessToken', data.data.accessToken);
      localStorage.setItem('refreshToken', data.data.refreshToken);
      localStorage.setItem('user', JSON.stringify(data.data.user));
    },
  });
}
