import { api } from '../lib/api';

export interface VerifyUserDto {
  verifyImageUrl: string;
}

// 사용자 인증 요청
export const verifyUser = async (data: VerifyUserDto) => {
  const response = await api.post('/user/verify', data);
  return response.data;
};