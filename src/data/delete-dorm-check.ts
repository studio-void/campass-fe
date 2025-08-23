import { isAxiosError } from 'axios';
import { toast } from 'sonner';

import { api } from '../lib/api';

export const deleteDormCheck = async (id: number): Promise<void> => {
  try {
    await api.delete<void>(`/dorm/check/${id}`);
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
