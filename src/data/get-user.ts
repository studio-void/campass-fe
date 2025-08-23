import { isAxiosError } from 'axios';
import { toast } from 'sonner';

import { api } from '../lib/api';

export enum VerifyStatus {
  VERIFIED = 'VERIFIED',
  AWAIT = 'AWAIT',
  NONE = 'NONE',
}

export interface GetUserResponse {
  id: number;
  email: string;
  name: string;
  nickname: string;
  school: string;
  number: string;
  isAdmin: boolean;
  verifyStatus: VerifyStatus;
  createdAt: string;
  updatedAt: string;
}

export const getUser = async (): Promise<GetUserResponse | undefined> => {
  try {
    const response = await api.get<GetUserResponse>('/user');
    return response.data;
  } catch (error) {
    console.error('Failed to get user:', error);

    if (isAxiosError(error)) {
      toast.error('Error fetching user information.', {
        description: error.message,
      });
    } else {
      toast.error('Error fetching user information.', {
        description: 'Unexpected error occurred.',
      });
    }
  }
};
