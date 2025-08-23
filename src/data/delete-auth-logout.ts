import { isAxiosError } from 'axios';
import { toast } from 'sonner';

import { useToken } from '../hooks/use-token';
import { api } from '../lib/api';

export interface DeleteLogoutResponse {
  message: string;
  success: boolean;
  timestamp: string;
}

export const deleteAuthLogout = async (): Promise<
  DeleteLogoutResponse | undefined
> => {
  try {
    const response = await api.post<DeleteLogoutResponse>('/auth/logout');
    useToken.getState().saveToken(null);

    return response.data;
  } catch (error) {
    console.error('Failed to logout:', error);

    if (isAxiosError(error)) {
      toast.error('Failed to logout.', {
        description: error.message,
      });
    } else {
      toast.error('Failed to logout.', {
        description: 'An unknown error occurred.',
      });
    }
  }
};
