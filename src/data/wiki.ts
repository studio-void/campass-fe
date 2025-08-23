import { isAxiosError } from 'axios';
import { toast } from 'sonner';

import { api } from '../lib/api';

export interface Wiki {
  id: number;
  title: string;
  content: string;
  authorId: number;
  school: string;
  createdAt: string;
  updatedAt: string;
  author?: {
    id: number;
    name: string;
    nickname: string;
  };
}

export interface WikiHistory {
  id: number;
  wikiId: number;
  editorId: number;
  content: string;
  comment: string;
  editedAt: string;
  editor: {
    id: number;
    name: string;
    nickname: string;
  };
}

export interface CreateWikiRequest {
  title: string;
  content: string;
}

export interface UpdateWikiRequest {
  title?: string;
  content?: string;
  comment?: string;
}

// 학교별 위키 목록 조회
export const getWikis = async (): Promise<Wiki[]> => {
  try {
    const response = await api.get<Wiki[]>('/wiki');
    return response.data;
  } catch (error) {
    console.error('Failed to get wikis:', error);

    if (isAxiosError(error)) {
      toast.error('Failed to load wiki list', {
        description: error.message,
      });
    } else {
      toast.error('Failed to load wiki list', {
        description: 'An unknown error occurred.',
      });
    }
    return [];
  }
};

// 위키 상세 조회
export const getWikiById = async (id: number): Promise<Wiki | null> => {
  try {
    const response = await api.get<Wiki>(`/wiki/${id}`);
    return response.data;
  } catch (error) {
    console.error('Failed to get wiki:', error);

    if (isAxiosError(error)) {
      toast.error('Failed to load wiki', {
        description: error.message,
      });
    } else {
      toast.error('Failed to load wiki', {
        description: 'An unknown error occurred.',
      });
    }
    return null;
  }
};

// 위키 생성
export const createWiki = async (
  data: CreateWikiRequest,
): Promise<Wiki | null> => {
  try {
    const response = await api.post<Wiki>('/wiki', data);
    toast.success('Wiki created successfully.');
    return response.data;
  } catch (error) {
    console.error('Failed to create wiki:', error);

    if (isAxiosError(error)) {
      toast.error('Failed to create wiki', {
        description: error.response?.data?.message || error.message,
      });
    } else {
      toast.error('Failed to create wiki', {
        description: 'An unknown error occurred.',
      });
    }
    return null;
  }
};

// 위키 수정
export const updateWiki = async (
  id: number,
  data: UpdateWikiRequest,
): Promise<Wiki | null> => {
  try {
    const response = await api.patch<Wiki>(`/wiki/${id}`, data);
    toast.success('Wiki updated successfully.');
    return response.data;
  } catch (error) {
    console.error('Failed to update wiki:', error);

    if (isAxiosError(error)) {
      const status = error.response?.status;
      if (status === 403) {
        toast.error('No permission to edit wiki', {
          description: 'Only the author can edit this wiki.',
        });
      } else {
        toast.error('Failed to update wiki', {
          description: error.response?.data?.message || error.message,
        });
      }
    } else {
      toast.error('Failed to update wiki', {
        description: 'An unknown error occurred.',
      });
    }
    return null;
  }
};

// 위키 삭제
export const deleteWiki = async (id: number): Promise<boolean> => {
  try {
    await api.delete(`/wiki/${id}`);
    toast.success('Wiki deleted successfully.');
    return true;
  } catch (error) {
    console.error('Failed to delete wiki:', error);

    if (isAxiosError(error)) {
      const status = error.response?.status;
      if (status === 403) {
        toast.error('No permission to delete wiki', {
          description: 'Only the author can delete this wiki.',
        });
      } else {
        toast.error('Failed to delete wiki', {
          description: error.response?.data?.message || error.message,
        });
      }
    } else {
      toast.error('Failed to delete wiki', {
        description: 'An unknown error occurred.',
      });
    }
    return false;
  }
};

// 위키 히스토리 조회
export const getWikiHistory = async (id: number): Promise<WikiHistory[]> => {
  try {
    const response = await api.get<WikiHistory[]>(`/wiki/history/${id}`);
    return response.data;
  } catch (error) {
    console.error('Failed to get wiki history:', error);

    if (isAxiosError(error)) {
      toast.error('Failed to load wiki history', {
        description: error.message,
      });
    } else {
      toast.error('Failed to load wiki history', {
        description: 'An unknown error occurred.',
      });
    }
    return [];
  }
};
