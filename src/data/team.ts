import { isAxiosError } from 'axios';
import { toast } from 'sonner';

import { api } from '../lib/api';

export type Team = {
  members: {
    id: number;
    email: string;
    name: string;
    nickname: string;
    school: string;
    number: string;
    isAdmin: boolean;
    createdAt: string;
    updatedAt: string;
  }[];
  id: number;
  createdAt: Date;
  updatedAt: Date;
  title: string;
};

// 모든 팀 목록 조회
export const listTeams = async () => {
  try {
    const response = await api.get<Team[]>('/user/team');
    return response.data;
  } catch (error) {
    toast.error('팀 목록을 불러오지 못했습니다.', {
      description: isAxiosError(error)
        ? error.message
        : 'Unexpected error occurred.',
    });
  }
};

// 새로운 팀 생성
export const createTeam = async (data: { name: string }) => {
  try {
    const response = await api.post('/user/team', data);
    return response.data;
  } catch (error) {
    toast.error('팀을 생성하지 못했습니다.', {
      description: isAxiosError(error)
        ? error.message
        : 'Unexpected error occurred.',
    });
  }
};

// 팀 나가기
export const leaveTeam = async (id: number) => {
  try {
    const response = await api.post(`/user/team/${id}/leave`);
    return response.data;
  } catch (error) {
    toast.error('팀에서 나가지 못했습니다.', {
      description: isAxiosError(error)
        ? error.message
        : 'Unexpected error occurred.',
    });
  }
};

// 팀 삭제
export const deleteTeam = async (id: number) => {
  try {
    const response = await api.delete(`/user/team/${id}`);
    return response.data;
  } catch (error) {
    toast.error('팀을 삭제하지 못했습니다.', {
      description: isAxiosError(error)
        ? error.message
        : 'Unexpected error occurred.',
    });
  }
};
