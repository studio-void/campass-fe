import { isAxiosError } from 'axios';
import { toast } from 'sonner';

import { api } from '../lib/api';

export interface PostDormCheckRequest {
  dorm: string;
  notes?: string;
  type: 'MAINTENANCE' | 'SINGLE_EXIT' | 'DOUBLE_EXIT';
  checkAt: string;
}

export const postDormCheck = async (
  data: PostDormCheckRequest,
): Promise<void> => {
  try {
    await api.post<void>('/dorm/check', data);
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
