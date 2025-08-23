import { api } from '../lib/api';

// 위키 삭제
export const deleteWiki = async (id: number) => {
  const response = await api.delete(`/wiki/${id}`);
  return response.data;
};