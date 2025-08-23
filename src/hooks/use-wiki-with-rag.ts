import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  type UpdateWikiRequest,
  createWiki,
  deleteWiki,
  getWikiById,
  getWikiHistory,
  getWikis,
  updateWiki,
} from '../data/wiki';
import { useRAG } from './use-rag';

export function useWikis() {
  return useQuery({
    queryKey: ['wikis'],
    queryFn: getWikis,
    staleTime: 5 * 60 * 1000, // 5분
  });
}

export function useWiki(id: number) {
  return useQuery({
    queryKey: ['wiki', id],
    queryFn: () => getWikiById(id),
    enabled: !!id,
  });
}

export function useWikiHistory(id: number) {
  return useQuery({
    queryKey: ['wikiHistory', id],
    queryFn: () => getWikiHistory(id),
    enabled: !!id,
  });
}

export function useCreateWiki() {
  const queryClient = useQueryClient();
  const { addWikiToRAG } = useRAG();

  return useMutation({
    mutationFn: createWiki,
    onSuccess: async (data) => {
      // 쿼리 캐시 무효화
      queryClient.invalidateQueries({ queryKey: ['wikis'] });

      // RAG 시스템에 새 위키 추가
      if (data) {
        try {
          await addWikiToRAG({
            id: data.id,
            title: data.title,
            content: data.content,
            school: data.school,
            author: data.author,
            createdAt: data.createdAt,
          });
        } catch (error) {
          console.error('Failed to add wiki to RAG:', error);
          // RAG 추가 실패는 사용자에게 별도 알림 (위키 생성은 성공)
        }
      }
    },
  });
}

export function useUpdateWiki() {
  const queryClient = useQueryClient();
  const { addWikiToRAG } = useRAG();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateWikiRequest }) =>
      updateWiki(id, data),
    onSuccess: async (updatedWiki, variables) => {
      const { id } = variables;

      // 쿼리 캐시 무효화
      queryClient.invalidateQueries({ queryKey: ['wikis'] });
      queryClient.invalidateQueries({ queryKey: ['wiki', id] });
      queryClient.invalidateQueries({ queryKey: ['wikiHistory', id] });

      // RAG 시스템의 위키 데이터 업데이트 (기존 제거 후 새로 추가)
      if (updatedWiki) {
        try {
          await addWikiToRAG({
            id: updatedWiki.id,
            title: updatedWiki.title,
            content: updatedWiki.content,
            school: updatedWiki.school,
            author: updatedWiki.author,
            createdAt: updatedWiki.createdAt,
          });
        } catch (error) {
          console.error('Failed to update wiki in RAG:', error);
        }
      }
    },
  });
}

export function useDeleteWiki() {
  const queryClient = useQueryClient();
  const { removeWikiFromRAG } = useRAG();

  return useMutation({
    mutationFn: deleteWiki,
    onSuccess: (_, wikiId) => {
      // 쿼리 캐시 무효화
      queryClient.invalidateQueries({ queryKey: ['wikis'] });
      queryClient.removeQueries({ queryKey: ['wiki', wikiId] });
      queryClient.removeQueries({ queryKey: ['wikiHistory', wikiId] });

      // RAG 시스템에서 위키 제거
      removeWikiFromRAG(wikiId);
    },
  });
}

// 모든 위키를 RAG 시스템에 동기화하는 훅
export function useSyncWikisToRAG() {
  const { data: wikis } = useWikis();
  const { addWikiToRAG } = useRAG();

  const syncAllWikis = async () => {
    if (!wikis || wikis.length === 0) {
      console.log('No wikis to sync');
      return;
    }

    const wikiData = wikis.map((wiki) => ({
      id: wiki.id,
      title: wiki.title,
      content: wiki.content,
      school: wiki.school,
      author: wiki.author,
      createdAt: wiki.createdAt,
    }));

    // 배치로 모든 위키 추가
    try {
      for (const wiki of wikiData) {
        await addWikiToRAG(wiki);
        // API 호출 제한을 피하기 위한 짧은 대기
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
      console.log(`Synced ${wikiData.length} wikis to RAG system`);
    } catch (error) {
      console.error('Failed to sync wikis to RAG:', error);
    }
  };

  return { syncAllWikis };
}
