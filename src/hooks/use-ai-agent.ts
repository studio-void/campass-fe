import { useState } from 'react';

import OpenAI from 'openai';
import { toast } from 'sonner';

import { useCurrentUser } from './use-current-user';
import { useRAG } from './use-rag';

export interface AgentMessage {
  id: string;
  role: 'user' | 'assistant' | 'tool';
  content: string;
  timestamp: Date;
  toolCalls?: Array<{
    id: string;
    type: 'function';
    function: {
      name: string;
      arguments: string;
    };
  }>;
  sources?: Array<{
    title: string;
    content: string;
    wikiId: number;
    school: string;
    author?: string;
    score: number;
  }>;
  functionCall?: {
    name: string;
    arguments: any;
    result: any;
  };
}

interface UseAIAgentReturn {
  messages: AgentMessage[];
  isLoading: boolean;
  sendMessage: (userInput: string) => Promise<void>;
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

// Available functions for the AI agent
const availableFunctions = {
  search_wiki: async (query: string, school?: string) => {
    // This will be implemented to search wiki documents
    return `Searching for "${query}" in wiki documents${school ? ` for ${school}` : ''}...`;
  },

  get_user_info: async () => {
    // Get current user information
    return 'Getting user information...';
  },

  create_calendar_event: async (
    title: string,
    date: string,
    description?: string,
  ) => {
    // Create a calendar event (mock implementation)
    return `Calendar event "${title}" created for ${date}${description ? ` with description: ${description}` : ''}`;
  },

  get_weather: async (
    location: string,
    unit: 'celsius' | 'fahrenheit' = 'celsius',
  ) => {
    // Mock weather function (similar to the example)
    if (location.toLowerCase().includes('seoul')) {
      return JSON.stringify({
        location: 'Seoul',
        temperature: '15',
        unit,
        condition: 'cloudy',
      });
    } else if (location.toLowerCase().includes('busan')) {
      return JSON.stringify({
        location: 'Busan',
        temperature: '18',
        unit,
        condition: 'sunny',
      });
    } else {
      return JSON.stringify({
        location,
        temperature: 'unknown',
        condition: 'unknown',
        unit,
      });
    }
  },

  calculate: async (expression: string) => {
    try {
      // Simple calculator (be careful with eval in production)
      const result = Function('"use strict"; return (' + expression + ')')();
      return JSON.stringify({ expression, result: result.toString() });
    } catch (error) {
      return JSON.stringify({ expression, error: 'Invalid expression' });
    }
  },
};

// Function definitions for OpenAI
const tools: OpenAI.Chat.Completions.ChatCompletionTool[] = [
  {
    type: 'function',
    function: {
      name: 'search_wiki',
      description: 'Search for information in wiki documents',
      parameters: {
        type: 'object',
        properties: {
          query: {
            type: 'string',
            description: 'Search query for wiki documents',
          },
          school: {
            type: 'string',
            description: 'Optional school filter for search',
          },
        },
        required: ['query'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_user_info',
      description: 'Get current user information',
      parameters: {
        type: 'object',
        properties: {},
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'create_calendar_event',
      description: 'Create a calendar event',
      parameters: {
        type: 'object',
        properties: {
          title: {
            type: 'string',
            description: 'Event title',
          },
          date: {
            type: 'string',
            description: 'Event date in YYYY-MM-DD format',
          },
          description: {
            type: 'string',
            description: 'Optional event description',
          },
        },
        required: ['title', 'date'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_weather',
      description: 'Get current weather information for a location',
      parameters: {
        type: 'object',
        properties: {
          location: {
            type: 'string',
            description: 'City name or location',
          },
          unit: {
            type: 'string',
            enum: ['celsius', 'fahrenheit'],
            description: 'Temperature unit',
          },
        },
        required: ['location'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'calculate',
      description: 'Perform mathematical calculations',
      parameters: {
        type: 'object',
        properties: {
          expression: {
            type: 'string',
            description:
              'Mathematical expression to calculate (e.g., "2 + 3 * 4")',
          },
        },
        required: ['expression'],
      },
    },
  },
];

export function useAIAgent(): UseAIAgentReturn {
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

  // Initialize OpenAI client
  const openai = new OpenAI({
    apiKey: import.meta.env.VITE_UPSTAGE_API_KEY,
    baseURL: 'https://api.upstage.ai/v1',
    dangerouslyAllowBrowser: true,
  });

  const defaultMessage: AgentMessage = {
    id: 'welcome',
    role: 'assistant',
    content:
      "Hello! I'm Campass AI Agent 🤖\n\nI'm an advanced AI assistant that can:\n- Search wiki documents\n- Get weather information\n- Perform calculations\n- Create calendar events\n- And much more!\n\nHow can I help you today?",
    timestamp: new Date(),
  };

  const [messages, setMessages] = useState<AgentMessage[]>([defaultMessage]);
  const [isLoading, setIsLoading] = useState(false);

  const clearMessages = () => {
    setMessages([defaultMessage]);
  };

  const executeFunction = async (
    functionName: string,
    args: any,
  ): Promise<string> => {
    try {
      switch (functionName) {
        case 'search_wiki':
          if (isInitialized) {
            const searchResults = user?.school
              ? await searchDocuments(args.query, user.school)
              : await searchDocuments(args.query);

            return JSON.stringify({
              query: args.query,
              results: searchResults.map((result) => ({
                title: result.document.metadata.title,
                content: result.document.content.substring(0, 200),
                wikiId: result.document.metadata.wikiId,
                school: result.document.metadata.school,
                score: result.score,
              })),
            });
          } else {
            return JSON.stringify({ error: 'RAG system is not initialized' });
          }

        case 'get_user_info':
          return JSON.stringify({
            name: user?.name || 'Unknown',
            email: user?.email || 'Unknown',
            school: user?.school || 'Unknown',
          });

        default:
          const func =
            availableFunctions[functionName as keyof typeof availableFunctions];
          if (func) {
            // Type-safe function calling
            if (functionName === 'create_calendar_event') {
              return await (func as any)(
                args.title,
                args.date,
                args.description,
              );
            } else if (functionName === 'get_weather') {
              return await (func as any)(args.location, args.unit);
            } else if (functionName === 'calculate') {
              return await (func as any)(args.expression);
            }
            return await (func as any)();
          }
          throw new Error(`Unknown function: ${functionName}`);
      }
    } catch (error) {
      console.error(`Error executing function ${functionName}:`, error);
      return JSON.stringify({
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  const sendMessage = async (userInput: string): Promise<void> => {
    if (!userInput.trim() || isLoading) return;

    const userMessage: AgentMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: userInput,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      // Prepare conversation messages for OpenAI
      const conversationMessages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] =
        [
          {
            role: 'system',
            content: `You are Campass AI Agent, a helpful assistant for university students. You have access to various tools including wiki search, weather information, calculations, and calendar management. Use the appropriate tools to provide accurate and helpful responses.${user?.school ? ` The user is from ${user.school}.` : ''}`,
          },
          ...messages
            .filter((msg) => msg.role !== 'tool')
            .map((msg) => ({
              role: msg.role as 'user' | 'assistant',
              content: msg.content,
            })),
          {
            role: 'user',
            content: userInput,
          },
        ];

      // Step 1: Send message with available tools
      const response = await openai.chat.completions.create({
        model: 'solar-pro2',
        messages: conversationMessages,
        tools: tools,
        tool_choice: 'auto',
        max_tokens: 1500,
        temperature: 0.7,
      });

      const responseMessage = response.choices[0].message;

      // Step 2: Check if the model wants to call functions
      if (responseMessage.tool_calls) {
        // Add assistant message with tool calls
        const assistantMessage: AgentMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: responseMessage.content || 'Let me help you with that...',
          timestamp: new Date(),
          toolCalls: responseMessage.tool_calls?.map((tc) => {
            const toolCall = tc as any;
            return {
              id: toolCall.id,
              type: 'function' as const,
              function: {
                name: toolCall.function?.name || '',
                arguments: toolCall.function?.arguments || '{}',
              },
            };
          }),
        };
        setMessages((prev) => [...prev, assistantMessage]);

        // Execute each function call
        const functionResults: AgentMessage[] = [];
        for (const toolCall of responseMessage.tool_calls) {
          const tc = toolCall as any;
          if (!tc.function) continue;
          const functionName = tc.function.name;
          const functionArgs = JSON.parse(tc.function.arguments);

          console.log(
            `Executing function: ${functionName} with args:`,
            functionArgs,
          );

          const functionResponse = await executeFunction(
            functionName,
            functionArgs,
          );

          const toolMessage: AgentMessage = {
            id: `tool-${toolCall.id}`,
            role: 'tool',
            content: functionResponse,
            timestamp: new Date(),
            functionCall: {
              name: functionName,
              arguments: functionArgs,
              result: functionResponse,
            },
          };

          functionResults.push(toolMessage);
        }

        setMessages((prev) => [...prev, ...functionResults]);

        // Step 3: Get final response from the model
        const finalMessages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] =
          [
            ...conversationMessages,
            {
              role: 'assistant',
              content: responseMessage.content,
              tool_calls: responseMessage.tool_calls,
            },
            ...functionResults.map((result) => ({
              role: 'tool' as const,
              tool_call_id: result.id.replace('tool-', ''),
              content: result.content,
            })),
          ];

        const finalResponse = await openai.chat.completions.create({
          model: 'solar-pro2',
          messages: finalMessages,
          max_tokens: 1500,
          temperature: 0.7,
        });

        const finalMessage: AgentMessage = {
          id: (Date.now() + 2).toString(),
          role: 'assistant',
          content:
            finalResponse.choices[0].message.content ||
            "I've completed the requested actions.",
          timestamp: new Date(),
        };

        setMessages((prev) => [...prev, finalMessage]);
      } else {
        // No function calls, just add the regular response
        const assistantMessage: AgentMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content:
            responseMessage.content ||
            "I apologize, but I couldn't generate a proper response.",
          timestamp: new Date(),
        };

        setMessages((prev) => [...prev, assistantMessage]);
      }
    } catch (error) {
      console.error('AI Agent error:', error);
      toast.error('An error occurred while processing your request');

      const errorMessage: AgentMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content:
          'I apologize, but an error occurred while processing your request. Please try again.',
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    messages,
    isLoading,
    sendMessage,
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
