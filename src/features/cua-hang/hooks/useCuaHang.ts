import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { cuaHangService } from '../../../services/cuaHangService';
import type { CreateCuaHangRequest } from '../../../types/cua-hang';

export const useGetCuaHangs = () => {
  return useQuery({
    queryKey: ['cuaHangs'],
    queryFn: () => cuaHangService.getCuaHangs(),
  });
};

export const useCreateCuaHang = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateCuaHangRequest) => cuaHangService.createCuaHang(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cuaHangs'] });
    },
  });
};
