import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { nhanVienService } from '../../../services/nhanVienService';
import type { GetNhanVienParams } from '../../../types/nhan-vien';

export const useGetNhanViens = (params: GetNhanVienParams) => {
  return useQuery({
    queryKey: ['nhanViens', params],
    queryFn: () => nhanVienService.getNhanViens(params),
  });
};

export const useCreateNhanVien = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: import('../../../types/nhan-vien').CreateNhanVienRequest) => 
      nhanVienService.createNhanVien(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['nhanViens'] });
    },
  });
};
