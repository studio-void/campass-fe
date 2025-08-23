import { isAxiosError } from 'axios';
import { toast } from 'sonner';

import { api } from '../lib/api';

export interface PostDormStorageRequest {
  storage: string;
  items: string;
  storeAt: string;
}

export const postDormStorage = async (
  data: PostDormStorageRequest,
): Promise<void> => {
  try {
    await api.post<void>('/dorm/storage', data);
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
