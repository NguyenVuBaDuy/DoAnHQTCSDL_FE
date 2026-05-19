import { useQuery } from '@tanstack/react-query';
import { khachHangService } from '../../../services/khachHangService';
import type { GetKhachHangParams } from '../../../types/khach-hang';

export const useGetKhachHangs = (params: GetKhachHangParams) => {
  return useQuery({
    queryKey: ['khachHangs', params],
    queryFn: () => khachHangService.getKhachHangs(params),
  });
};
