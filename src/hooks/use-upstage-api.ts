import { useState } from 'react';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface UseUpstageApiReturn {
  messages: Message[];
  isLoading: boolean;
  sendMessage: (userInput: string) => Promise<void>;
  addMessage: (message: Message) => void;
  clearMessages: () => void;
}

export function useUpstageApi(): UseUpstageApiReturn {
  const defaultMessage: Message = {
    id: 'welcome',
    role: 'assistant',
    content:
      "Hi there :) I'm your Campass AI, an AI assistant to help you with anything you need related to your school life. How can I help you today?",
    timestamp: new Date(),
  };
  const [messages, setMessages] = useState<Message[]>([defaultMessage]);
  const [isLoading, setIsLoading] = useState(false);

  const addMessage = (message: Message) => {
    setMessages((prev) => [...prev, message]);
  };

  const clearMessages = () => {
    setMessages([defaultMessage]);
  };

  const sendMessage = async (userInput: string): Promise<void> => {
    if (!userInput.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: userInput,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    const assistantMessageId = (Date.now() + 1).toString();
    const assistantMessage: Message = {
      id: assistantMessageId,
      role: 'assistant',
      content: '',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, assistantMessage]);

    try {
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
                content:
                  import.meta.env.VITE_UPSTAGE_SYSTEM_PROMPT ||
                  'You are a helpful assistant.',
              },
              ...messages.map((msg) => ({
                role: msg.role,
                content: msg.content,
              })),
              {
                role: 'user',
                content: userInput,
              },
            ],
            max_tokens: 1000,
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
                      ? { ...msg, content: fullContent }
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
              ? { ...msg, content: 'Sorry. Unable to generate a response.' }
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
                content: 'Unexpected error occurred. Please try again later.',
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
  };
}
