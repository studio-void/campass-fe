import { api } from '../lib/api';

// 회원 탈퇴
export const deleteUser = async () => {
  const response = await api.delete('/user');
  return response.data;
};
