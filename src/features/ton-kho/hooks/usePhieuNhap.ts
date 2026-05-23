import { useMutation, useQueryClient } from "@tanstack/react-query";
import { phieuNhapService } from "../../../services/phieuNhapService";
import type { CreatePhieuNhapRequest } from "../../../types/phieu-nhap";

export const useCreatePhieuNhap = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreatePhieuNhapRequest) =>
      phieuNhapService.createPhieuNhap(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["phieu-nhap"] });
    },
  });
};
