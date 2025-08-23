import { isAxiosError } from 'axios';
import { toast } from 'sonner';

import { api } from '../lib/api';

export interface PostUserRequest {
  email: string;
  password: string;
  name: string;
  tel: string;
  nickname: string;
  school: string;
  number: string;
}

enum UserVerifyStatus {
  NONE = 'NONE',
  PENDING = 'PENDING',
  VERIFIED = 'VERIFIED',
}

enum UserSchool {
  GIST = 'GIST',
  POSTECH = 'POSTECH',
  KAIST = 'KAIST',
}

export interface PostUserResponse {
  id: number;
  email: string;
  name: string;
  school: UserSchool;
  isVerified: boolean;
  verifyStatus: UserVerifyStatus;
  isAdmin: boolean;
  createdAt: string;
  updatedAt: string;
}

export const postUser = async (signupData: PostUserRequest) => {
  try {
    const response = await api.post<PostUserResponse>('/user', signupData);
    return response.data;
  } catch (error) {
    if (isAxiosError(error)) {
      toast.error(error.response?.data.message || 'An error occurred');
    }
    throw error;
  }
};
