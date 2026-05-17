import { useMutation } from '@tanstack/react-query';
import { authService } from '../services/authService';
import { fetchCurrentUser } from '../store/authSlice';
import { useAppDispatch } from '../store';
import type { LoginRequest, LoginResponse, LoginError } from '../types/auth';

export function useLogin() {
  const dispatch = useAppDispatch();

  return useMutation<LoginResponse, LoginError, LoginRequest>({
    mutationFn: authService.login,
    onSuccess: (data) => {
      // Lưu token vào localStorage
      localStorage.setItem('accessToken', data.data.accessToken);
      localStorage.setItem('refreshToken', data.data.refreshToken);
      localStorage.setItem('user', JSON.stringify(data.data.user));

      // Lấy thông tin người dùng hiện tại và lưu vào Redux store
      dispatch(fetchCurrentUser());
    },
  });
}
