import apiClient from "../lib/axios";
import type { ApiResponse } from "../types/api";

export interface UploadImageData {
  url: string;
  publicId: string;
  width: number;
  height: number;
  format: string;
}

export const uploadService = {
  uploadImage: async (file: File): Promise<ApiResponse<UploadImageData>> => {
    const formData = new FormData();
    formData.append("file", file);
    
    const { data } = await apiClient.post<ApiResponse<UploadImageData>>(
      "/upload/image",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    
    return data;
  },
};
