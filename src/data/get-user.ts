import { isAxiosError } from 'axios';
import { toast } from 'sonner';

import { api } from '../lib/api';

export enum School {
  GIST = 'GIST',
  POSTECH = 'POSTECH',
  KAIST = 'KAIST',
}

export enum VerifyStatus {
  VERIFIED = 'VERIFIED',
  AWAIT = 'AWAIT',
  NONE = 'NONE',
}

export interface GetUserResponse {
  id: number;
  email: string;
  name: string;
  nickname: string;
  school: School;
  number: string;
  isAdmin: boolean;
  verifyStatus: VerifyStatus;
  createdAt: string;
  updatedAt: string;
}

export const getUserSchool = async (): Promise<School | undefined> => {
  const user = await getUser();
  return user?.school;
};

export const getUser = async (): Promise<GetUserResponse | undefined> => {
  try {
    const response = await api.get<GetUserResponse>('/user');

    // Update localStorage with user admin status
    if (response.data) {
      localStorage.setItem('isAdmin', response.data.isAdmin.toString());
      // Dispatch event to notify other components
      window.dispatchEvent(new CustomEvent('authStateChanged'));
    }

    return response.data;
  } catch (error) {
    console.error('Failed to get user:', error);

    if (isAxiosError(error)) {
      toast.error('Error fetching user information.', {
        description: error.message,
      });
    } else {
      toast.error('Error fetching user information.', {
        description: 'Unexpected error occurred.',
      });
    }
  }
};
