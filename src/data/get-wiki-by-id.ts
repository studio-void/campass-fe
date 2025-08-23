import { api } from '../lib/api';

// ID로 위키 상세 조회
export const getWikiById = async (id: number) => {
  const response = await api.get(`/wiki/${id}`);
  return response.data;
};
