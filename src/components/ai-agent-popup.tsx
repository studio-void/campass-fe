import React, { useEffect, useRef } from 'react';

import { Bot, FileSearch, Loader2, Send, User, Wrench } from 'lucide-react';

import { type AgentMessage, useAIAgent } from '../hooks/use-ai-agent';
import { MarkdownRenderer } from './markdown-renderer';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Input } from './ui/input';

interface AIAgentPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AIAgentPopup({ isOpen, onClose }: AIAgentPopupProps) {
  const {
    messages,
    isLoading,
    sendMessage,
    clearMessages,
    ragStatus,
    initializeRAG,
  } = useAIAgent();

  const [inputValue, setInputValue] = React.useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSend = async () => {
    if (!inputValue.trim() || isLoading) return;

    const message = inputValue;
    setInputValue('');
    await sendMessage(message);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const renderMessage = (message: AgentMessage) => {
    const isUser = message.role === 'user';
    const isTool = message.role === 'tool';

    if (isTool) {
      return (
        <div key={message.id} className="flex items-start space-x-3 mb-6">
          <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
            <Wrench size={16} className="text-blue-600" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
              <div className="text-sm font-medium text-blue-800 mb-1">
                Function: {message.functionCall?.name}
              </div>
              <div className="text-sm text-blue-600">
                <pre className="whitespace-pre-wrap overflow-auto">
                  {typeof message.functionCall?.result === 'string'
                    ? message.functionCall.result
                    : JSON.stringify(message.functionCall?.result, null, 2)}
                </pre>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div
        key={message.id}
        className={`flex items-start space-x-3 mb-6 ${
          isUser ? 'flex-row-reverse space-x-reverse' : ''
        }`}
      >
        <div
          className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
            isUser
              ? 'bg-blue-600 text-white'
              : 'bg-gradient-to-r from-purple-500 to-blue-500 text-white'
          }`}
        >
          {isUser ? <User size={16} /> : <Bot size={16} />}
        </div>

        <div
          className={`flex-1 min-w-0 ${isUser ? 'text-right' : 'text-left'}`}
        >
          <div
            className={`inline-block max-w-[80%] p-4 rounded-lg ${
              isUser
                ? 'bg-blue-600 text-white'
                : 'bg-white border border-gray-200 text-gray-900'
            }`}
          >
            {isUser ? (
              <div className="whitespace-pre-wrap break-words">
                {message.content}
              </div>
            ) : (
              <div className="prose prose-sm max-w-none">
                <MarkdownRenderer content={message.content} />
              </div>
            )}

            {message.toolCalls && message.toolCalls.length > 0 && (
              <div className="mt-3 pt-3 border-t border-gray-200">
                <div className="text-sm font-medium text-gray-600 mb-2">
                  🔧 Using tools:
                </div>
                <div className="space-y-1">
                  {message.toolCalls.map((toolCall: any, index: number) => (
                    <div
                      key={`${toolCall.id}-${index}`}
                      className="text-xs bg-gray-100 rounded px-2 py-1"
                    >
                      {toolCall.function.name}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {message.sources && message.sources.length > 0 && (
              <div className="mt-3 pt-3 border-t border-gray-200">
                <div className="text-sm font-medium text-gray-600 mb-2">
                  📚 Sources:
                </div>
                <div className="space-y-2">
                  {message.sources.map((source: any, index: number) => (
                    <div
                      key={`${source.wikiId}-${index}`}
                      className="text-xs bg-blue-50 rounded p-2 border border-blue-200"
                    >
                      <div className="font-medium text-blue-800">
                        {source.title}
                      </div>
                      <div className="text-blue-600 mt-1">
                        {source.school} • {(source.score * 100).toFixed(1)}%
                        relevance
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div
            className={`text-xs text-gray-500 mt-1 ${
              isUser ? 'text-right' : 'text-left'
            }`}
          >
            {message.timestamp.toLocaleTimeString()}
          </div>
        </div>
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl h-[80vh] flex flex-col bg-white">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
              <Bot size={16} className="text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Campass AI Agent
              </h2>
              <p className="text-sm text-gray-600">
                Advanced AI Assistant with Function Calling
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {!ragStatus.isInitialized && (
              <Button
                onClick={initializeRAG}
                disabled={ragStatus.isIndexing}
                size="sm"
                variant="outline"
                className="flex items-center space-x-2"
              >
                <FileSearch size={14} />
                <span>Initialize RAG</span>
              </Button>
            )}
            <Button onClick={clearMessages} size="sm" variant="outline">
              Clear
            </Button>
            <Button onClick={onClose} size="sm" variant="outline">
              ×
            </Button>
          </div>
        </div>

        {/* RAG Status */}
        {ragStatus.isIndexing && (
          <div className="px-4 py-2 bg-blue-50 border-b border-blue-200">
            <div className="flex items-center space-x-2">
              <Loader2 size={16} className="animate-spin text-blue-600" />
              <span className="text-sm text-blue-800">
                Initializing RAG system...{' '}
                {ragStatus.indexingProgress &&
                  `${ragStatus.indexingProgress.current}/${ragStatus.indexingProgress.total}`}
              </span>
            </div>
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
          <div className="max-w-4xl mx-auto">
            {messages.map(renderMessage)}
            {isLoading && (
              <div className="flex items-start space-x-3 mb-6">
                <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                  <Bot size={16} className="text-white" />
                </div>
                <div className="flex-1">
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center space-x-2">
                      <Loader2
                        size={16}
                        className="animate-spin text-gray-500"
                      />
                      <span className="text-gray-500">Thinking...</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input */}
        <div className="p-4 border-t border-gray-200 bg-white">
          <div className="flex space-x-3">
            <Input
              ref={inputRef}
              value={inputValue}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setInputValue(e.target.value)
              }
              onKeyPress={handleKeyPress}
              placeholder="Ask me anything... I can search wikis, check weather, calculate, and more!"
              disabled={isLoading}
              className="flex-1"
            />
            <Button
              onClick={handleSend}
              disabled={isLoading || !inputValue.trim()}
              size="icon"
            >
              <Send size={16} />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
