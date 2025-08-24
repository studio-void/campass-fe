import { isAxiosError } from 'axios';
import { toast } from 'sonner';

import { api } from '../lib/api';

// 친구 목록 조회
export const getFriends = async () => {
  try {
    const response = await api.get('/user/friend');
    return response.data;
  } catch (error) {
    toast.error('친구 목록을 불러오지 못했습니다.', {
      description: isAxiosError(error)
        ? error.message
        : 'Unexpected error occurred.',
    });
  }
};

// 친구 요청 보내기
export const sendFriendRequest = async (toId: number) => {
  try {
    const response = await api.post(`/user/friend/request/${toId}`);
    return response.data;
  } catch (error) {
    toast.error('친구 요청을 보내지 못했습니다.', {
      description: isAxiosError(error)
        ? error.message
        : 'Unexpected error occurred.',
    });
  }
};

// 친구 요청 수락
export const acceptFriendRequest = async (requestId: number) => {
  try {
    const response = await api.post(`/user/friend/accept/${requestId}`);
    return response.data;
  } catch (error) {
    toast.error('친구 요청을 수락하지 못했습니다.', {
      description: isAxiosError(error)
        ? error.message
        : 'Unexpected error occurred.',
    });
  }
};

// 친구 요청 거절
export const rejectFriendRequest = async (requestId: number) => {
  try {
    const response = await api.post(`/user/friend/reject/${requestId}`);
    return response.data;
  } catch (error) {
    toast.error('친구 요청을 거절하지 못했습니다.', {
      description: isAxiosError(error)
        ? error.message
        : 'Unexpected error occurred.',
    });
  }
};

// 친구 삭제
export const removeFriend = async (friendId: number) => {
  try {
    const response = await api.delete(`/user/friend/${friendId}`);
    return response.data;
  } catch (error) {
    toast.error('친구를 삭제하지 못했습니다.', {
      description: isAxiosError(error)
        ? error.message
        : 'Unexpected error occurred.',
    });
  }
};

// 받은 친구 요청 목록
export const getReceivedFriendRequests = async () => {
  try {
    const response = await api.get('/user/friend/requests/received');
    return response.data;
  } catch (error) {
    toast.error('받은 친구 요청 목록을 불러오지 못했습니다.', {
      description: isAxiosError(error)
        ? error.message
        : 'Unexpected error occurred.',
    });
  }
};

// 보낸 친구 요청 목록
export const getSentFriendRequests = async () => {
  try {
    const response = await api.get('/user/friend/requests/sent');
    return response.data;
  } catch (error) {
    toast.error('보낸 친구 요청 목록을 불러오지 못했습니다.', {
      description: isAxiosError(error)
        ? error.message
        : 'Unexpected error occurred.',
    });
  }
};
