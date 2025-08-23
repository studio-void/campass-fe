import { api } from '../lib/api';

export interface CreateWikiDto {
  title: string;
  content: string;
}

// 위키 생성
export const createWiki = async (data: CreateWikiDto) => {
  const response = await api.post('/wiki', data);
  return response.data;
};