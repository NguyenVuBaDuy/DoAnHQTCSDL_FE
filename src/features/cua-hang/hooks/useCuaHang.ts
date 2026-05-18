import { useQuery } from '@tanstack/react-query';
import { cuaHangService } from '../../../services/cuaHangService';

export const useGetCuaHangs = () => {
  return useQuery({
    queryKey: ['cuaHangs'],
    queryFn: () => cuaHangService.getCuaHangs(),
  });
};
