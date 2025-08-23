import { api } from '../lib/api';

// 위키 히스토리 조회
export const getWikiHistory = async (id: number) => {
  const response = await api.get(`/wiki/history/${id}`);
  return response.data;
};
