import { api } from '../lib/api';

// API 기본 정보 조회
export const getAppInfo = async () => {
  const response = await api.get('/');
  return response.data;
};