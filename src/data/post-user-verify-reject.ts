import { isAxiosError } from 'axios';
import { toast } from 'sonner';

import { api } from '../lib/api';

export const postUserVerifyReject = async (userId: number): Promise<void> => {
  try {
    await api.post<void>(`/user/verify/reject/${userId}`);
  } catch (error) {
    console.error('Failed to reject user verification:', error);

    if (error instanceof Response) {
      toast.error('Failed to reject user verification.', {
        description: `Status: ${error.statusText || error.status}`,
      });
    } else if (isAxiosError(error)) {
      toast.error('Failed to reject user verification.', {
        description: error.message,
      });
    } else {
      toast.error('Failed to reject user verification.', {
        description: 'An unknown error occurred.',
      });
    }
  }
};
