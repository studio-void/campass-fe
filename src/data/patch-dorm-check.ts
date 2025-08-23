import { isAxiosError } from 'axios';
import { toast } from 'sonner';

import { api } from '../lib/api';

export interface PatchDormCheckRequest {
  status: 'FIRST_CHECK' | 'PASS' | 'SECOND_CHECK' | 'THIRD_CHECK' | 'FAIL';
  dorm: string | undefined;
  notes?: string;
  type: 'MAINTENANCE' | 'SINGLE_EXIT' | 'DOUBLE_EXIT' | undefined;
  checkAt: string | undefined;
}

export const patchDormCheck = async (
  data: PatchDormCheckRequest,
  id: number,
): Promise<void> => {
  try {
    await api.patch<void>(`/dorm/check/${id}`, data);
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
