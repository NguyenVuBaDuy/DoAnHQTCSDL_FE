import { useQuery } from "@tanstack/react-query";
import { nhaCungCapService } from "../../../services/nhaCungCapService";

export const useGetNhaCungCaps = () => {
  return useQuery({
    queryKey: ["nhaCungCaps"],
    queryFn: () => nhaCungCapService.getNhaCungCaps(),
  });
};
