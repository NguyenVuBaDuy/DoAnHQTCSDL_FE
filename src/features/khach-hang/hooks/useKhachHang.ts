import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { khachHangService } from '../../../services/khachHangService';
import type { GetKhachHangParams } from '../../../types/khach-hang';

export const useGetKhachHangs = (params: GetKhachHangParams) => {
  return useQuery({
    queryKey: ['khachHangs', params],
    queryFn: () => khachHangService.getKhachHangs(params),
  });
};

export const useCreateKhachHang = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: khachHangService.createKhachHang,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['khachHangs'] });
    },
  });
};

export const useUpdateKhachHang = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: import('../../../types/khach-hang').CreateKhachHangRequest }) =>
      khachHangService.updateKhachHang(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['khachHangs'] });
    },
  });
};
