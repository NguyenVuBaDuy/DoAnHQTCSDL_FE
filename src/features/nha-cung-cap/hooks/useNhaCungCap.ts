import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { nhaCungCapService } from "../../../services/nhaCungCapService";
import type { CreateNhaCungCapRequest } from "../../../types/nha-cung-cap";

export const useGetNhaCungCaps = () => {
  return useQuery({
    queryKey: ["nhaCungCaps"],
    queryFn: nhaCungCapService.getNhaCungCaps,
  });
};

export const useCreateNhaCungCap = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: nhaCungCapService.createNhaCungCap,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["nhaCungCaps"] });
    },
  });
};

export const useUpdateNhaCungCap = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: CreateNhaCungCapRequest }) =>
      nhaCungCapService.updateNhaCungCap(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["nhaCungCaps"] });
    },
  });
};

export const useChangeStatusNhaCungCap = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, trangThai }: { id: number; trangThai: string }) =>
      nhaCungCapService.changeStatusNhaCungCap(id, { trangThai }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["nhaCungCaps"] });
    },
  });
};
