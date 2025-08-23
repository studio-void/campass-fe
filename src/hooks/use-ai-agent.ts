import { useState } from 'react';

import type { NavigateOptions, ToOptions } from '@tanstack/react-router';
import OpenAI from 'openai';
import { toast } from 'sonner';

import type { NavigationFunctions } from './use-agent-navigation';
import { createNavigationFunctions } from './use-agent-navigation';
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
  usedTools?: Array<{
    name: string;
    description: string;
    success: boolean;
    args?: any;
    result?: any;
  }>;
  ragUsed?: {
    searchQuery: string;
    documentsFound: number;
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
  navigationFunctions?: NavigationFunctions;
}

// Available functions for the AI agent
const createAvailableFunctions = (
  navigationFunctions?: NavigationFunctions,
) => ({
  search_wiki: async (query: string, school?: string) => {
    return JSON.stringify({
      message: `Searching for "${query}" in wiki documents${school ? ` for ${school}` : ''}`,
      query,
      school: school || null,
    });
  },

  get_user_info: async () => {
    return JSON.stringify({
      message: 'Getting user information',
      action: 'get_user_info',
    });
  },

  create_calendar_event: async (
    title: string,
    date: string,
    description?: string,
  ) => {
    return JSON.stringify({
      message: `Calendar event "${title}" created for ${date}`,
      title,
      date,
      description: description || null,
      status: 'created',
    });
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

  // Navigation functions
  navigate_to_page: async (page: string, wikiId?: string) => {
    if (!navigationFunctions) {
      return JSON.stringify({ error: 'Navigation not available' });
    }

    try {
      const result = await navigationFunctions.navigateToPage({
        page,
        ...(wikiId && { wikiId }),
      });
      return JSON.stringify(result);
    } catch (error) {
      return JSON.stringify({
        error: error instanceof Error ? error.message : 'Navigation failed',
      });
    }
  },

  get_available_pages: async () => {
    if (!navigationFunctions) {
      return JSON.stringify({ error: 'Navigation not available' });
    }

    const pages = navigationFunctions.getAvailablePages();
    return JSON.stringify({ pages });
  },

  search_pages: async (keyword: string) => {
    if (!navigationFunctions) {
      return JSON.stringify({ error: 'Navigation not available' });
    }

    const results = navigationFunctions.searchPages(keyword);
    return JSON.stringify({ results });
  },

  go_home: async () => {
    if (!navigationFunctions) {
      return JSON.stringify({ error: 'Navigation not available' });
    }

    const result = await navigationFunctions.goHome();
    return JSON.stringify(result);
  },

  go_to_wiki: async () => {
    if (!navigationFunctions) {
      return JSON.stringify({ error: 'Navigation not available' });
    }

    const result = await navigationFunctions.goToWiki();
    return JSON.stringify(result);
  },

  go_to_wiki_article: async (wikiId: string) => {
    if (!navigationFunctions) {
      return JSON.stringify({ error: 'Navigation not available' });
    }

    const result = await navigationFunctions.goToWikiArticle(wikiId);
    return JSON.stringify(result);
  },

  go_to_dorm: async () => {
    if (!navigationFunctions) {
      return JSON.stringify({ error: 'Navigation not available' });
    }

    const result = await navigationFunctions.goToDorm();
    return JSON.stringify(result);
  },

  go_to_admin: async () => {
    if (!navigationFunctions) {
      return JSON.stringify({ error: 'Navigation not available' });
    }

    const result = await navigationFunctions.goToAdmin();
    return JSON.stringify(result);
  },

  go_to_document_parsing: async () => {
    if (!navigationFunctions) {
      return JSON.stringify({ error: 'Navigation not available' });
    }

    const result = await navigationFunctions.goToDocumentParsing();
    return JSON.stringify(result);
  },
});

// Function definitions for OpenAI
const createTools = (
  hasNavigation: boolean = false,
): OpenAI.Chat.Completions.ChatCompletionTool[] => {
  const baseTools: OpenAI.Chat.Completions.ChatCompletionTool[] = [
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

  const navigationTools: OpenAI.Chat.Completions.ChatCompletionTool[] =
    hasNavigation
      ? [
          {
            type: 'function',
            function: {
              name: 'navigate_to_page',
              description: 'Navigate to a specific page in the application',
              parameters: {
                type: 'object',
                properties: {
                  page: {
                    type: 'string',
                    description:
                      'Page key or path to navigate to (e.g., "home", "wiki", "dorm", "admin")',
                  },
                  wikiId: {
                    type: 'string',
                    description:
                      'Wiki article ID (required for wiki article pages)',
                  },
                },
                required: ['page'],
              },
            },
          },
          {
            type: 'function',
            function: {
              name: 'get_available_pages',
              description:
                'Get list of all available pages that can be navigated to',
              parameters: {
                type: 'object',
                properties: {},
              },
            },
          },
          {
            type: 'function',
            function: {
              name: 'search_pages',
              description: 'Search for pages by keyword',
              parameters: {
                type: 'object',
                properties: {
                  keyword: {
                    type: 'string',
                    description:
                      'Keyword to search for in page names and descriptions',
                  },
                },
                required: ['keyword'],
              },
            },
          },
          {
            type: 'function',
            function: {
              name: 'go_home',
              description: 'Navigate to the main home page',
              parameters: {
                type: 'object',
                properties: {},
              },
            },
          },
          {
            type: 'function',
            function: {
              name: 'go_to_wiki',
              description: 'Navigate to the wiki main page',
              parameters: {
                type: 'object',
                properties: {},
              },
            },
          },
          {
            type: 'function',
            function: {
              name: 'go_to_wiki_article',
              description: 'Navigate to a specific wiki article',
              parameters: {
                type: 'object',
                properties: {
                  wikiId: {
                    type: 'string',
                    description: 'ID of the wiki article to navigate to',
                  },
                },
                required: ['wikiId'],
              },
            },
          },
          {
            type: 'function',
            function: {
              name: 'go_to_dorm',
              description: 'Navigate to dormitory services page',
              parameters: {
                type: 'object',
                properties: {},
              },
            },
          },
          {
            type: 'function',
            function: {
              name: 'go_to_admin',
              description: 'Navigate to admin dashboard',
              parameters: {
                type: 'object',
                properties: {},
              },
            },
          },
          {
            type: 'function',
            function: {
              name: 'go_to_document_parsing',
              description: 'Navigate to document parsing page',
              parameters: {
                type: 'object',
                properties: {},
              },
            },
          },
        ]
      : [];

  return [...baseTools, ...navigationTools];
};

// Helper function to get tool descriptions
const getToolDescription = (toolName: string): string => {
  const descriptions: Record<string, string> = {
    search_wiki: 'Search for information in wiki documents',
    get_user_info: 'Get current user information',
    create_calendar_event: 'Create a calendar event',
    get_weather: 'Get weather information for a location',
    calculate: 'Perform mathematical calculations',
    navigate_to_page: 'Navigate to a specific page',
    get_available_pages: 'Get list of available pages',
    search_pages: 'Search for pages by keyword',
    go_home: 'Navigate to home page',
    go_to_wiki: 'Navigate to wiki main page',
    go_to_wiki_article: 'Navigate to specific wiki article',
    go_to_dorm: 'Navigate to dormitory services',
    go_to_admin: 'Navigate to admin dashboard',
    go_to_document_parsing: 'Navigate to document parsing page',
  };

  return descriptions[toolName] || `Execute ${toolName}`;
};

export function useAIAgent(
  navigate?: (options: ToOptions & NavigateOptions) => void,
): UseAIAgentReturn {
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

  // Create navigation functions if navigate is provided
  const navigationFunctions = navigate
    ? createNavigationFunctions(navigate)
    : undefined;

  // Create available functions with navigation support
  const availableFunctions = createAvailableFunctions(navigationFunctions);

  // Create tools with navigation support
  const tools = createTools(!!navigationFunctions);

  // Initialize OpenAI client
  const openai = new OpenAI({
    apiKey: import.meta.env.VITE_UPSTAGE_API_KEY,
    baseURL: 'https://api.upstage.ai/v1',
    dangerouslyAllowBrowser: true,
  });

  const defaultMessage: AgentMessage = {
    id: 'welcome',
    role: 'assistant',
    content: `Hello! I'm Campass AI Agent 🤖

I'm an advanced AI assistant that can:
- 🔍 Search wiki documents
- 🌤️ Get weather information
- 🧮 Perform calculations
- 📅 Create calendar events${navigationFunctions ? '\n- 🧭 Navigate to different pages' : ''}
- And much more!

How can I help you today?`,
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
            } else if (functionName === 'navigate_to_page') {
              return await (func as any)(args.page, args.wikiId);
            } else if (functionName === 'search_pages') {
              return await (func as any)(args.keyword);
            } else if (functionName === 'go_to_wiki_article') {
              return await (func as any)(args.wikiId);
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
            content: `You are Campass AI Agent, a helpful assistant for university students. You have access to various tools including wiki search, weather information, calculations, calendar management${navigationFunctions ? ', and page navigation' : ''}. 

IMPORTANT: When a user asks to navigate to a page AND search for content (e.g., "go to wiki about library"), handle both actions in sequence but provide a single comprehensive response that combines the navigation result with the search results. Do not create separate messages for each tool call.

Use the appropriate tools to provide accurate and helpful responses.${user?.school ? ` The user is from ${user.school}.` : ''}${navigationFunctions ? ' You can help users navigate to different pages in the application by using navigation functions.' : ''}`,
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
        // Don't show intermediate assistant message with tool calls to user
        // Just execute functions silently

        // Execute each function call
        const functionResults: AgentMessage[] = [];
        const usedTools: Array<{
          name: string;
          description: string;
          success: boolean;
          args?: any;
          result?: any;
        }> = [];

        for (const toolCall of responseMessage.tool_calls) {
          const tc = toolCall as any;
          if (!tc.function) continue;
          const functionName = tc.function.name;
          const functionArgs = JSON.parse(tc.function.arguments);

          console.log(
            `Executing function: ${functionName} with args:`,
            functionArgs,
          );

          try {
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

            // Track successful tool usage
            usedTools.push({
              name: functionName,
              description: getToolDescription(functionName),
              success: true,
              args: functionArgs,
              result: functionResponse,
            });
          } catch (error) {
            // Track failed tool usage
            usedTools.push({
              name: functionName,
              description: getToolDescription(functionName),
              success: false,
              args: functionArgs,
              result: error instanceof Error ? error.message : 'Unknown error',
            });
          }
        }

        // Don't add intermediate function results to messages
        // setMessages((prev) => [...prev, ...functionResults]);

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
          usedTools: usedTools.length > 0 ? usedTools : undefined,
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
    navigationFunctions,
  };
}
