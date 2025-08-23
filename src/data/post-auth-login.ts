import { isAxiosError } from 'axios';
import { toast } from 'sonner';

import { useToken } from '../hooks/use-token';
import { api } from '../lib/api';

export interface PostLoginRequest {
  email: string;
  password: string;
}

export interface PostLoginResponse {
  accessToken: string;
}

export const postAuthLogin = async (
  loginData: PostLoginRequest,
): Promise<PostLoginResponse | undefined> => {
  try {
    const response = await api.post<PostLoginResponse>(
      '/auth/login',
      loginData,
    );
    useToken.getState().saveToken(response.data.accessToken);

    // Update localStorage for login state
    localStorage.setItem('isLoggedIn', 'true');

    // For now, we'll need to check if user is admin after getting user data
    // This is a temporary solution - in a real app you'd get this from the login response
    localStorage.setItem('isAdmin', 'false'); // Default to false, will be updated when user data is fetched

    // Dispatch event to notify other components
    window.dispatchEvent(new CustomEvent('authStateChanged'));

    return response.data;
  } catch (error) {
    console.error('Failed to get user:', error);

    if (isAxiosError(error)) {
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
