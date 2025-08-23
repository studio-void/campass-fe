import { api } from '../lib/api';

export interface CreateFacilityDto {
  name: string;
  description?: string;
  imageUrl?: string;
  location: string;
  isAvailable?: boolean;
  openTime: string;
  closeTime: string;
}

export interface UpdateFacilityDto {
  name?: string;
  description?: string;
  imageUrl?: string;
  location?: string;
  isAvailable?: boolean;
  openTime?: string;
  closeTime?: string;
}

export interface UseFacilityDto {
  startTime: string;
  endTime: string;
}

// 시설 목록 조회
export const getAllFacilities = async () => {
  const response = await api.get('/facility');
  return response.data;
};

// 시설 생성
export const createFacility = async (data: CreateFacilityDto) => {
  const response = await api.post('/facility', data);
  return response.data;
};

// ID로 시설 상세 조회
export const getFacilityById = async (id: number) => {
  const response = await api.get(`/facility/${id}`);
  return response.data;
};

// 시설 정보 수정
export const updateFacility = async (id: number, data: UpdateFacilityDto) => {
  const response = await api.patch(`/facility/${id}`, data);
  return response.data;
};

// 시설 삭제
export const deleteFacility = async (id: number) => {
  const response = await api.delete(`/facility/${id}`);
  return response.data;
};

// 시설 예약하기
export const useFacility = async (id: number, data: UseFacilityDto) => {
  const response = await api.post(`/facility/use/${id}`, data);
  return response.data;
};