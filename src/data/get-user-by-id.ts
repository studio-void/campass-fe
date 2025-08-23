import { api } from '../lib/api';

// ID로 사용자 정보 조회
export const getUserById = async (id: number) => {
  const response = await api.get(`/user/${id}`);
  return response.data;
};
