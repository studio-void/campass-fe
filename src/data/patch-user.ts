import { api } from '../lib/api';

export interface UpdateUserDto {
  password?: string;
  name?: string;
  nickname?: string;
  tel?: string;
}

// 사용자 정보 수정
export const updateUser = async (data: UpdateUserDto) => {
  const response = await api.patch('/user', data);
  return response.data;
};
