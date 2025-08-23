import { api } from '../lib/api';

// ID로 기숙사 창고 보관 신청 상세 조회
export const getDormStorageById = async (id: number) => {
  const response = await api.get(`/dorm/storage/${id}`);
  return response.data;
};