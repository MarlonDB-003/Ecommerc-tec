import { api } from "@/lib/api";

export interface UserProfileDto {
  userId: string;
  email: string;
  displayName: string | null;
  phone: string | null;
  avatarUrl: string | null;
  isAdmin: boolean;
}

export interface UpdateProfilePayload {
  displayName?: string | null;
  phone?: string | null;
  avatarUrl?: string | null;
}

export const userService = {
  getMyProfile: () => api.get<UserProfileDto>("/api/users/me"),
  updateProfile: (data: UpdateProfilePayload) => api.put<UserProfileDto>("/api/users/me", data),
  uploadAvatar: (file: File) => {
    const formData = new FormData();
    formData.append("image", file);
    return api.postMultipart<UserProfileDto>("/api/users/me/avatar", formData);
  },
};
