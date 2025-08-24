import { isAxiosError } from 'axios';
import { toast } from 'sonner';

import { api } from '../lib/api';

export interface VerifyUserDto {
  verifyImageUrl: string;
}

// 사용자 인증 요청
export const postUserVerify = async (data: VerifyUserDto) => {
  try {
    const response = await api.post('/user/verify', data);
    return response.data;
  } catch (error) {
    console.error('Failed to request user verification:', error);

    if (isAxiosError(error)) {
      toast.error('Failed to request user verification.', {
        description: error.message,
      });
    } else {
      toast.error('Failed to request user verification.', {
        description: 'An unknown error occurred.',
      });
    }
  }
};
