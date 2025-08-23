import { useEffect, useState } from 'react';

import { toast } from 'sonner';

import { getWikis } from '../data/wiki';
import { type SearchResult, vectorStore } from '../lib/vector-store';

interface UseRAGReturn {
  isInitialized: boolean;
  isIndexing: boolean;
  documentCount: number;
  chunkCount: number;
  chunkDistribution: { [articleTitle: string]: number };
  indexingProgress: {
    current: number;
    total: number;
    status: string;
  } | null;
  searchDocuments: (query: string, school?: string) => Promise<SearchResult[]>;
  initializeRAG: () => Promise<void>;
  addWikiToRAG: (wiki: {
    id: number;
    title: string;
    content: string;
    school: string;
    author?: { name: string; nickname: string };
    createdAt: string;
  }) => Promise<void>;
  removeWikiFromRAG: (wikiId: number) => void;
}

export function useRAG(): UseRAGReturn {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isIndexing, setIsIndexing] = useState(false);
  const [documentCount, setDocumentCount] = useState(0);
  const [chunkCount, setChunkCount] = useState(0);
  const [chunkDistribution, setChunkDistribution] = useState<{
    [articleTitle: string]: number;
  }>({});
  const [indexingProgress, setIndexingProgress] = useState<{
    current: number;
    total: number;
    status: string;
  } | null>(null);

  const updateDocumentCount = () => {
    const docCount = vectorStore.getDocumentCount();
    const chunkCnt = vectorStore.getChunkCount();
    const distribution = vectorStore.getChunkDistribution();
    
    setDocumentCount(docCount);
    setChunkCount(chunkCnt);
    setChunkDistribution(distribution);
    
    console.log(`Updated counts - Articles: ${docCount}, Chunks: ${chunkCnt}`);
  };

  // Check if RAG is already initialized from localStorage on mount
  useEffect(() => {
    const docCount = vectorStore.getDocumentCount();
    const chunkCnt = vectorStore.getChunkCount();
    
    if (docCount > 0) {
      setIsInitialized(true);
      updateDocumentCount();
      console.log(
        `RAG system loaded from localStorage with ${docCount} articles (${chunkCnt} chunks)`,
      );
    }
  }, []);

  const initializeRAG = async () => {
    if (isIndexing) return;

    setIsIndexing(true);
    setIndexingProgress({ current: 0, total: 0, status: 'Starting...' });

    try {
      console.log('Initializing RAG system...');

      // Get all wiki documents
      const wikis = await getWikis();

      if (wikis.length === 0) {
        toast.info('No wiki documents available');
        setIsInitialized(true);
        return;
      }

      // Clear existing vector store
      vectorStore.clearAll();

      // Add wiki documents to vector store with progress tracking
      const wikiData = wikis.map((wiki) => ({
        id: wiki.id,
        title: wiki.title,
        content: wiki.content,
        school: wiki.school,
        author: wiki.author,
        createdAt: wiki.createdAt,
      }));

      // Use setTimeout to make the initialization non-blocking
      setTimeout(async () => {
        try {
          const result = await vectorStore.addWikiDocuments(
            wikiData,
            (current, total, status) => {
              setIndexingProgress({ current, total, status });
            },
          );

          updateDocumentCount();
          setIsInitialized(true);
          setIndexingProgress(null);

          console.log(
            `RAG system initialized with ${result.processedArticles} articles (${result.totalChunks} chunks)`,
          );
        } catch (error) {
          console.error('Failed to initialize RAG:', error);
          toast.error('RAG system initialization failed');
          setIsInitialized(false);
          setIndexingProgress(null);
        } finally {
          setIsIndexing(false);
        }
      }, 100); // Small delay to prevent UI blocking
    } catch (error) {
      console.error('Failed to get wikis for RAG initialization:', error);
      toast.error('Failed to fetch wiki documents');
      setIsInitialized(false);
      setIndexingProgress(null);
      setIsIndexing(false);
    }
  };
  const searchDocuments = async (
    query: string,
    school?: string,
  ): Promise<SearchResult[]> => {
    if (!isInitialized) {
      console.warn('RAG system is not initialized');
      return [];
    }

    try {
      if (school) {
        return await vectorStore.searchBySchool(query, school);
      } else {
        return await vectorStore.searchSimilarDocuments(query);
      }
    } catch (error) {
      console.error('Failed to search documents:', error);
      return [];
    }
  };

  const addWikiToRAG = async (wiki: {
    id: number;
    title: string;
    content: string;
    school: string;
    author?: { name: string; nickname: string };
    createdAt: string;
  }) => {
    try {
      await vectorStore.addWikiDocument(wiki);
      updateDocumentCount();
      console.log(`Added wiki "${wiki.title}" to RAG system`);
    } catch (error) {
      console.error('Failed to add wiki to RAG:', error);
      throw error;
    }
  };

  const removeWikiFromRAG = (wikiId: number) => {
    vectorStore.removeWikiDocument(wikiId);
    updateDocumentCount();
    console.log(`Removed wiki ${wikiId} from RAG system`);
  };

  // Initialize document count on component mount
  useEffect(() => {
    updateDocumentCount();
  }, []);

  return {
    isInitialized,
    isIndexing,
    documentCount,
    chunkCount,
    chunkDistribution,
    indexingProgress,
    searchDocuments,
    initializeRAG,
    addWikiToRAG,
    removeWikiFromRAG,
  };
}
