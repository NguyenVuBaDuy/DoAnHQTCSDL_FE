import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { cuaHangService } from '../../../services/cuaHangService';
import type { CreateCuaHangRequest } from '../../../types/cua-hang';

export const useGetCuaHangs = () => {
  return useQuery({
    queryKey: ['cuaHangs'],
    queryFn: () => cuaHangService.getCuaHangs(),
  });
};

export const useGetCuaHangById = (id: number | undefined) => {
  return useQuery({
    queryKey: ['cuaHang', id],
    queryFn: () => cuaHangService.getCuaHangById(id!),
    enabled: !!id,
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

export const useUpdateCuaHang = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: CreateCuaHangRequest }) => 
      cuaHangService.updateCuaHang(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['cuaHangs'] });
      queryClient.invalidateQueries({ queryKey: ['cuaHang', variables.id] });
    },
  });
};
