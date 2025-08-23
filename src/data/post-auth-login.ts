import { isAxiosError } from 'axios';
import { toast } from 'sonner';

import { useToken } from '../hooks/use-token';
import { api } from '../lib/api';

export interface PostLoginRequest {
  email: string;
  password: string;
}

export interface PostLoginResponse {
  access_token: string;
}

export const postAuthLogin = async (
  loginData: PostLoginRequest,
): Promise<PostLoginResponse | undefined> => {
  try {
    const response = await api.post<PostLoginResponse>(
      '/auth/login',
      loginData,
    );
    useToken.getState().saveToken(response.data.access_token);

    return response.data;
  } catch (error) {
    console.error('Failed to get user:', error);

    if (error instanceof Response) {
      toast.error('Failed to login.', {
        description: `Status: ${error.statusText || error.status}`,
      });
    } else if (isAxiosError(error)) {
      toast.error('Failed to login.', {
        description: error.message,
      });
    } else {
      toast.error('Failed to login.', {
        description: 'An unknown error occurred.',
      });
    }
  }
};
