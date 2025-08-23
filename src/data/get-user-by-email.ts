import { api } from '../lib/api';

// 이메일로 사용자 정보 조회
export const getUserByEmail = async (email: string) => {
  const response = await api.get(`/user/email/${email}`);
  return response.data;
};