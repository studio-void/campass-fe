import { isAxiosError } from 'axios';
import { toast } from 'sonner';

import { api } from '../lib/api';

export interface PatchDormStorageRequest {
  isStored?: boolean;
  storage?: string;
  items?: string;
  storeAt?: string;
}

export const patchDormStorage = async (
  data: PatchDormStorageRequest,
  id: number,
): Promise<void> => {
  try {
    await api.patch<void>(`/dorm/storage/${id}`, data);
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
