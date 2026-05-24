import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { voucherService } from "../../../services/voucherService";
import type { VoucherRequest } from "../../../types/voucher";

export const useGetVouchers = (params?: {
  search?: string;
  page?: number;
  size?: number;
}) => {
  return useQuery({
    queryKey: ["vouchers", params],
    queryFn: () => voucherService.getVouchers(params),
  });
};

export const useCreateVoucher = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: voucherService.createVoucher,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vouchers"] });
    },
  });
};

export const useUpdateVoucher = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ code, data }: { code: string; data: VoucherRequest }) =>
      voucherService.updateVoucher(code, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vouchers"] });
    },
  });
};

export const useDeleteVoucher = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: voucherService.deleteVoucher,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vouchers"] });
    },
  });
};
