import { api } from '../lib/api';

export interface CreateEquipmentDto {
  name: string;
  description?: string;
  imageUrl?: string;
  isAvailable?: boolean;
}

export interface UpdateEquipmentDto {
  name?: string;
  description?: string;
  imageUrl?: string;
  isAvailable?: boolean;
}

// 연구 장비 목록 조회
export const getAllEquipment = async () => {
  const response = await api.get('/research/equipment');
  return response.data;
};

// 연구 장비 생성
export const createEquipment = async (data: CreateEquipmentDto) => {
  const response = await api.post('/research/equipment', data);
  return response.data;
};

// ID로 연구 장비 상세 조회
export const getEquipmentById = async (id: number) => {
  const response = await api.get(`/research/equipment/${id}`);
  return response.data;
};

// 연구 장비 정보 수정
export const updateEquipment = async (id: number, data: UpdateEquipmentDto) => {
  const response = await api.patch(`/research/equipment/${id}`, data);
  return response.data;
};

// 연구 장비 삭제
export const deleteEquipment = async (id: number) => {
  const response = await api.delete(`/research/equipment/${id}`);
  return response.data;
};

// 장비 사용 기록 및 통계 조회
export const getEquipmentHistory = async (id: number) => {
  const response = await api.get(`/research/equipment/history/${id}`);
  return response.data;
};

// 장비 사용 시작
export const useEquipment = async (id: number) => {
  const response = await api.patch(`/research/equipment/use/${id}`);
  return response.data;
};

// 장비 사용 종료
export const stopUsingEquipment = async (id: number) => {
  const response = await api.delete(`/research/equipment/use/${id}`);
  return response.data;
};