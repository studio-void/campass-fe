import { api } from '../lib/api';

export interface CreateNoteDto {
  title: string;
  content: string;
}

export interface UpdateNoteDto {
  title?: string;
  content?: string;
}

// 연구 노트 목록 조회
export const getAllNotes = async () => {
  const response = await api.get('/research/notes');
  return response.data;
};

// 연구 노트 생성
export const createNote = async (data: CreateNoteDto) => {
  const response = await api.post('/research/notes', data);
  return response.data;
};

// 연구 노트 상세 조회
export const getNoteById = async (id: number) => {
  const response = await api.get(`/research/notes/${id}`);
  return response.data;
};

// 연구 노트 수정
export const updateNote = async (id: number, data: UpdateNoteDto) => {
  const response = await api.patch(`/research/notes/${id}`, data);
  return response.data;
};

// 연구 노트 삭제
export const deleteNote = async (id: number) => {
  const response = await api.delete(`/research/notes/${id}`);
  return response.data;
};