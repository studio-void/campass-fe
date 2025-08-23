import { isAxiosError } from 'axios';
import { toast } from 'sonner';

import { api } from '../lib/api';

export interface GetDormStorageResponse {
  user: {
    id: number;
    email: string;
    password: string;
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
  userId: number;
  storage: string;
  items: string;
  isStored: boolean;
  storeAt: Date;
}

export const getDormStorage = async (): Promise<
  GetDormStorageResponse[] | undefined
> => {
  try {
    const response = await api.get<GetDormStorageResponse[]>('/dorm/storage');

    return response.data;
  } catch (error) {
    console.error('Failed to fetch dorm storage data:', error);

    if (isAxiosError(error)) {
      toast.error('Error fetching dorm storage data.', {
        description: error.message,
      });
    } else {
      toast.error('Error fetching dorm storage data.', {
        description: 'Unexpected error occurred.',
      });
    }
  }
};
