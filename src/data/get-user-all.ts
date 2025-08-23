import { api } from '../lib/api';

// 모든 사용자 목록 조회
export const getAllUsers = async () => {
  const response = await api.get('/user/all');
  return response.data;
};