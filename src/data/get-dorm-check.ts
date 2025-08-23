import { isAxiosError } from 'axios';
import { toast } from 'sonner';

import { api } from '../lib/api';

export interface GetDormCheckResponse {
  user: {
    id: number;
    email: string;
    name: string;
    nickname: string;
    tel: string;
    school: string;
    number: string;
    isAdmin: boolean;
    verifyStatus: 'NONE' | 'PENDING' | 'VERIFIED';
    verifyImageUrl: string | null;
    createdAt: Date;
    updatedAt: Date;
  };
  id: number;
  createdAt: Date;
  updatedAt: Date;
  notes: string | null;
  userId: number;
  dorm: string;
  type: 'MAINTENANCE' | 'SINGLE_EXIT' | 'DOUBLE_EXIT';
  status: 'FIRST_CHECK' | 'PASS' | 'SECOND_CHECK' | 'THIRD_CHECK' | 'FAIL';
  checkAt: Date;
}

export const getDormCheck = async (): Promise<
  GetDormCheckResponse[] | undefined
> => {
  try {
    const response = await api.get<GetDormCheckResponse[]>('/dorm/check');

    return response.data;
  } catch (error) {
    console.error('Failed to fetch dorm check data:', error);

    if (isAxiosError(error)) {
      toast.error('Error fetching dorm check data.', {
        description: error.message,
      });
    } else {
      toast.error('Error fetching dorm check data.', {
        description: 'Unexpected error occurred.',
      });
    }
  }
};
