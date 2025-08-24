import { api } from '../lib/api';
import type { GetUserResponse } from './get-user';

// 모든 사용자 목록 조회
export const getAllUsers = async () => {
  const response = await api.get<GetUserResponse[]>('/user/all');
  return response.data;
};
