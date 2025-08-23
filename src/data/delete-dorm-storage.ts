import { api } from '../lib/api';

// 기숙사 창고 보관 신청 삭제
export const deleteDormStorage = async (id: number) => {
  const response = await api.delete(`/dorm/storage/${id}`);
  return response.data;
};