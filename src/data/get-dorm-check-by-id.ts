import { api } from '../lib/api';

// ID로 기숙사 검사 요청 상세 조회
export const getDormCheckById = async (id: number) => {
  const response = await api.get(`/dorm/check/${id}`);
  return response.data;
};
