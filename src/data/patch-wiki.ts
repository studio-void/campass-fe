import { api } from '../lib/api';

export interface UpdateWikiDto {
  title?: string;
  content?: string;
  comment?: string;
}

// 위키 수정
export const updateWiki = async (id: number, data: UpdateWikiDto) => {
  const response = await api.patch(`/wiki/${id}`, data);
  return response.data;
};