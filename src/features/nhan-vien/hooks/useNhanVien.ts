import { useQuery } from '@tanstack/react-query';
import { nhanVienService } from '../../../services/nhanVienService';
import type { GetNhanVienParams } from '../../../types/nhan-vien';

export const useGetNhanViens = (params: GetNhanVienParams) => {
  return useQuery({
    queryKey: ['nhanViens', params],
    queryFn: () => nhanVienService.getNhanViens(params),
  });
};
