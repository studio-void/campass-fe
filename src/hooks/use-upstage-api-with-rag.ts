import { useState } from 'react';

import { toast } from 'sonner';

import { useCurrentUser } from './use-current-user';
import { useRAG } from './use-rag';
import { type Message as BaseMessage } from './use-upstage-api';

export interface RAGMessage extends BaseMessage {
  sources?: Array<{
    title: string;
    content: string;
    wikiId: number;
    school: string;
    author?: string;
    score: number;
  }>;
}

interface UseUpstageApiWithRAGReturn {
  messages: RAGMessage[];
  isLoading: boolean;
  sendMessage: (userInput: string) => Promise<void>;
  addMessage: (message: RAGMessage) => void;
  clearMessages: () => void;
  ragStatus: {
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
  };
  initializeRAG: () => Promise<void>;
}

export function useUpstageApiWithRAG(): UseUpstageApiWithRAGReturn {
  const { user } = useCurrentUser();
  const {
    isInitialized,
    isIndexing,
    documentCount,
    chunkCount,
    chunkDistribution,
    indexingProgress,
    searchDocuments,
    initializeRAG,
  } = useRAG();

  const defaultMessage: RAGMessage = {
    id: 'welcome',
    role: 'assistant',
    content:
      "Hello! I'm Campass AI :) \n\nI'm an AI assistant that can help you with everything related to your school life. I can find relevant information from wiki documents to provide you with more accurate and useful answers.\n\nHow can I help you today?",
    timestamp: new Date(),
  };

  const [messages, setMessages] = useState<RAGMessage[]>([defaultMessage]);
  const [isLoading, setIsLoading] = useState(false);

  const addMessage = (message: RAGMessage) => {
    setMessages((prev) => [...prev, message]);
  };

  const clearMessages = () => {
    setMessages([defaultMessage]);
  };

  const buildContextFromSources = (
    sources: Array<{
      title: string;
      content: string;
      wikiId: number;
      school: string;
      author?: string;
      score: number;
    }>,
  ): string => {
    if (sources.length === 0) return '';

    let context = 'Here is relevant wiki document information:\n\n';

    sources.forEach((source, index) => {
      context += `[Document ${index + 1}] ${source.title}\n`;
      context += `School: ${source.school}\n`;
      if (source.author) {
        context += `Author: ${source.author}\n`;
      }
      context += `Content: ${source.content.substring(0, 300)}${source.content.length > 300 ? '...' : ''}\n`;
      context += `Relevance: ${(source.score * 100).toFixed(1)}%\n\n`;
    });

    context +=
      'Please answer based on the above information and cite your sources.';
    return context;
  };

  const sendMessage = async (userInput: string): Promise<void> => {
    if (!userInput.trim() || isLoading) return;

    const userMessage: RAGMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: userInput,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    const assistantMessageId = (Date.now() + 1).toString();
    const assistantMessage: RAGMessage = {
      id: assistantMessageId,
      role: 'assistant',
      content: '',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, assistantMessage]);

    try {
      let sources: Array<{
        title: string;
        content: string;
        wikiId: number;
        school: string;
        author?: string;
        score: number;
      }> = [];

      // Perform RAG search (only when RAG is initialized)
      if (isInitialized) {
        try {
          const searchResults = user?.school
            ? await searchDocuments(userInput, user.school)
            : await searchDocuments(userInput);

          sources = searchResults.map((result) => ({
            title: result.document.metadata.title,
            content: result.document.content,
            wikiId: result.document.metadata.wikiId,
            school: result.document.metadata.school,
            author: result.document.metadata.author,
            score: result.score,
          }));

          console.log(
            `Found ${sources.length} relevant documents for query: "${userInput}"`,
          );
        } catch (error) {
          console.error('RAG search failed:', error);
          toast.error(
            'An error occurred while searching for relevant documents',
          );
        }
      }

      // Configure system prompt
      let systemPrompt =
        import.meta.env.VITE_UPSTAGE_SYSTEM_PROMPT ||
        'You are a friendly and helpful AI assistant for university students. Please provide accurate and useful information related to school life.';

      if (sources.length > 0) {
        systemPrompt += '\n\n' + buildContextFromSources(sources);
      } else if (isInitialized) {
        systemPrompt +=
          '\n\nNo wiki documents related to the current question were found. Please answer based on general knowledge.';
      } else {
        systemPrompt +=
          '\n\nRAG system is not initialized. Please answer based on general knowledge.';
      }

      // Configure conversation history
      const conversationMessages = messages
        .filter((msg) => msg.role === 'user' || msg.role === 'assistant')
        .map((msg) => ({
          role: msg.role,
          content: msg.content,
        }));

      const response = await fetch(
        'https://api.upstage.ai/v1/solar/chat/completions',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${import.meta.env.VITE_UPSTAGE_API_KEY}`,
          },
          body: JSON.stringify({
            model: 'solar-pro2',
            messages: [
              {
                role: 'system',
                content: systemPrompt,
              },
              ...conversationMessages,
              {
                role: 'user',
                content: userInput,
              },
            ],
            max_tokens: 1500,
            temperature: 0.7,
            stream: true,
          }),
        },
      );

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let fullContent = '';

      if (!reader) {
        throw new Error('Unable to read stream.');
      }

      while (true) {
        const { done, value } = await reader.read();

        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);

            if (data === '[DONE]') {
              continue;
            }

            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices?.[0]?.delta?.content;

              if (content) {
                fullContent += content;

                setMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === assistantMessageId
                      ? {
                          ...msg,
                          content: fullContent,
                          sources: sources.length > 0 ? sources : undefined,
                        }
                      : msg,
                  ),
                );
              }
            } catch (parseError) {
              console.error('JSON parsing error:', parseError);
              continue;
            }
          }
        }
      }

      if (!fullContent) {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantMessageId
              ? {
                  ...msg,
                  content: 'Sorry, I was unable to generate a response.',
                  sources: sources.length > 0 ? sources : undefined,
                }
              : msg,
          ),
        );
      }
    } catch (error) {
      console.error('Upstage API error:', error);

      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantMessageId
            ? {
                ...msg,
                content:
                  'An unexpected error occurred. Please try again later.',
              }
            : msg,
        ),
      );
    } finally {
      setIsLoading(false);
    }
  };

  return {
    messages,
    isLoading,
    sendMessage,
    addMessage,
    clearMessages,
    ragStatus: {
      isInitialized,
      isIndexing,
      documentCount,
      chunkCount,
      chunkDistribution,
      indexingProgress,
    },
    initializeRAG,
  };
}
