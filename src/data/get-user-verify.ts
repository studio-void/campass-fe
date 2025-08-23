import { isAxiosError } from 'axios';
import { toast } from 'sonner';

import { api } from '../lib/api';

export interface GetUserVerifyResponse {
  number: string | null;
  name: string;
  id: number;
  school: string;
  createdAt: Date;
  updatedAt: Date;
  email: string;
  password: string;
  nickname: string;
  tel: string;
  isAdmin: boolean;
  verifyStatus: 'NONE' | 'PENDING' | 'VERIFIED';
  verifyImageUrl: string | null;
}

export const getUserVerify = async (): Promise<
  GetUserVerifyResponse[] | undefined
> => {
  try {
    const response = await api.get<GetUserVerifyResponse[]>('/user/verify');

    return response.data;
  } catch (error) {
    console.error('Failed to get user:', error);

    if (error instanceof Response) {
      toast.error('Error fetching user information.', {
        description: `Status: ${error.statusText || error.status}`,
      });
    } else if (isAxiosError(error)) {
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
