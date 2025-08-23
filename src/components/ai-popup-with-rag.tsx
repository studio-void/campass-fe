import { useEffect, useRef, useState } from 'react';

import {
  IconDatabase,
  IconExternalLink,
  IconRefresh,
  IconResize,
  IconSearch,
  IconSend,
  IconTool,
  IconTrash,
  IconUser,
} from '@tabler/icons-react';
import { useNavigate } from '@tanstack/react-router';
import ReactMarkdown from 'react-markdown';

import { useUpstageApiWithRAG } from '../hooks';
import { CampassLogo } from './index';

interface AIPopupWithRAGProps {
  isOpen: boolean;
}

function AIPopupWithRAG({ isOpen }: AIPopupWithRAGProps) {
  const navigate = useNavigate();
  const {
    messages,
    isLoading,
    sendMessage,
    clearMessages,
    ragStatus,
    initializeRAG,
  } = useUpstageApiWithRAG();

  const [input, setInput] = useState('');
  const [showSources, setShowSources] = useState<string | null>(null);
  const [dimensions, setDimensions] = useState({ width: 384, height: 500 });
  const [targetDimensions, setTargetDimensions] = useState({
    width: 384,
    height: 500,
  });
  const [isResizing, setIsResizing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const resizeRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number>(0);

  const [cornerRadius, setCornerRadius] = useState(12);

  // Spring animation function
  const lerp = (start: number, end: number, factor: number) => {
    return start + (end - start) * factor;
  };

  const animateToTarget = () => {
    const springFactor = 0.15; // Adjust this for more/less bounce
    const threshold = 0.5;

    const widthDiff = Math.abs(dimensions.width - targetDimensions.width);
    const heightDiff = Math.abs(dimensions.height - targetDimensions.height);

    if (widthDiff > threshold || heightDiff > threshold) {
      setDimensions((prev) => ({
        width: lerp(prev.width, targetDimensions.width, springFactor),
        height: lerp(prev.height, targetDimensions.height, springFactor),
      }));

      animationRef.current = requestAnimationFrame(animateToTarget);
    } else {
      setDimensions(targetDimensions);
    }
  };

  useEffect(() => {
    if (!isDragging) {
      animationRef.current = requestAnimationFrame(animateToTarget);
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [targetDimensions, isDragging]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const el = resizeRef.current;
    if (!el) return;

    const updateRadius = () => {
      const cs = getComputedStyle(el);
      const r = parseFloat(cs.borderTopLeftRadius || '12');
      if (!Number.isNaN(r)) setCornerRadius(r);
    };

    updateRadius();
    window.addEventListener('resize', updateRadius);
    return () => window.removeEventListener('resize', updateRadius);
  }, [dimensions.width, dimensions.height]);

  // Resize functionality with spring animation
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing || !resizeRef.current) return;

      const rect = resizeRef.current.getBoundingClientRect();
      const newWidth = Math.max(320, rect.right - e.clientX);
      const newHeight = Math.max(300, rect.bottom - e.clientY);

      if (isDragging) {
        // Direct update while dragging for immediate feedback
        setDimensions({ width: newWidth, height: newHeight });
      } else {
        // Use spring animation when not actively dragging
        setTargetDimensions({ width: newWidth, height: newHeight });
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      setIsDragging(false);

      // Add a subtle overshoot effect
      if (resizeRef.current) {
        const rect = resizeRef.current.getBoundingClientRect();
        const finalWidth = Math.max(320, rect.width);
        const finalHeight = Math.max(300, rect.height);

        // Slight overshoot for rubber effect
        const overshootFactor = 1.02;
        setTargetDimensions({
          width: finalWidth * overshootFactor,
          height: finalHeight * overshootFactor,
        });

        // Return to normal size after a brief delay
        setTimeout(() => {
          setTargetDimensions({ width: finalWidth, height: finalHeight });
        }, 100);
      }
    };

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing, isDragging]);

  const handleResizeStart = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
    setIsDragging(true);

    // Cancel any ongoing animation
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
  };

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userInput = input;
    setInput('');
    await sendMessage(userInput);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleClearMessages = () => {
    clearMessages();
  };

  const handleInitializeRAG = async () => {
    await initializeRAG();
  };

  const toggleSources = (messageId: string) => {
    setShowSources(showSources === messageId ? null : messageId);
  };

  const handleWikiNavigation = (wikiId: number) => {
    navigate({
      to: '/wiki/$wikiId',
      params: { wikiId: wikiId.toString() },
    });
  };

  if (!isOpen) return null;

  return (
    <div
      ref={resizeRef}
      className={`fixed bottom-28 right-8 bg-white rounded-xl shadow-2xl z-40 flex flex-col overflow-hidden transition-all duration-75 ease-out ${
        isResizing ? 'select-none' : ''
      }`}
      style={{
        width: `${dimensions.width}px`,
        height: `${dimensions.height}px`,
        minWidth: '320px',
        minHeight: '300px',
        transform: isDragging ? 'scale(1.01)' : 'scale(1)',
        boxShadow: isDragging
          ? '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(0, 0, 0, 0.05)'
          : '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      }}
    >
      {/* Resize Handle */}
      {(() => {
        const stroke = Math.max(2, Math.round(cornerRadius * 0.18)); // visual thickness
        const size = Math.max(24, Math.round(cornerRadius * 2)); // square sized to the corner radius
        const r = Math.max(2, cornerRadius - stroke / 2); // inner radius so the stroke sits inside the curve
        return (
          <div
            className="group absolute top-0 left-0 z-50 cursor-nw-resize select-none"
            style={{ width: size, height: size }}
            onMouseDown={handleResizeStart}
            title="Drag to resize"
            aria-label="Drag to resize"
          >
            {/* bigger invisible hit area */}
            <div className="absolute -top-1 -left-1 w-[40px] h-[40px]" />
            <svg
              className="absolute top-0 left-0 pointer-events-none"
              width={size}
              height={size}
              viewBox={`0 0 ${size} ${size}`}
            >
              <path
                d={`M ${stroke / 2} ${r + stroke / 2} A ${r} ${r} 0 0 1 ${r + stroke / 2} ${stroke / 2}`}
                fill="none"
                stroke={
                  isDragging
                    ? 'rgba(255,255,255,0.95)'
                    : 'rgba(255,255,255,0.75)'
                }
                strokeWidth={stroke}
                strokeLinecap="round"
              />
            </svg>
          </div>
        );
      })()}
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-secondary text-white p-4 rounded-t-xl">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <CampassLogo type="white" size={20} />
            Campass AI
          </h2>
          <div className="flex gap-1">
            <button
              onClick={handleInitializeRAG}
              disabled={isLoading || ragStatus.isIndexing}
              title="Initialize RAG System"
              type="button"
              aria-label="Initialize RAG system"
              className="p-1 hover:bg-white/20 rounded transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <IconRefresh
                className={`h-4 w-4 ${ragStatus.isIndexing ? 'animate-spin' : ''}`}
              />
            </button>
            <button
              onClick={handleClearMessages}
              disabled={isLoading}
              title="Clear Conversation"
              type="button"
              aria-label="Clear conversation"
              className="p-1 hover:bg-white/20 rounded transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <IconTrash className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* RAG Status */}
        <div className="mt-2 text-xs opacity-90 flex items-center gap-2">
          <IconDatabase className="h-3 w-3" />
          <span>
            {ragStatus.isInitialized
              ? `RAG Active (${ragStatus.documentCount} articles, ${ragStatus.chunkCount} chunks)`
              : ragStatus.isIndexing
                ? ragStatus.indexingProgress
                  ? `Indexing: ${ragStatus.indexingProgress.current}/${ragStatus.indexingProgress.total} - ${ragStatus.indexingProgress.status}`
                  : 'Initializing RAG...'
                : 'RAG Inactive'}
          </span>
          {ragStatus.isIndexing && ragStatus.indexingProgress && (
            <div className="flex-1 bg-white/20 rounded-full h-1 ml-2">
              <div
                className="bg-white h-1 rounded-full transition-all duration-200"
                style={{
                  width: `${
                    ragStatus.indexingProgress.total > 0
                      ? (ragStatus.indexingProgress.current /
                          ragStatus.indexingProgress.total) *
                        100
                      : 0
                  }%`,
                }}
              />
            </div>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
        {messages.map((message) => (
          <div key={message.id}>
            <div
              className={`flex gap-3 ${
                message.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {message.role === 'assistant' && (
                <div className="flex-shrink-0">
                  <div
                    className={`w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center ${
                      isLoading &&
                      messages[messages.length - 1]?.id === message.id
                        ? 'animate-pulse'
                        : ''
                    }`}
                  >
                    <CampassLogo type="white" size={16} />
                  </div>
                </div>
              )}
              <div
                className={`max-w-[70%] p-3 rounded-lg ${
                  message.role === 'user'
                    ? 'bg-gradient-to-br from-primary to-secondary text-white font-semibold'
                    : 'bg-gray-100 text-gray-900'
                }`}
              >
                {message.role === 'assistant' ? (
                  <div className="text-sm markdown-content">
                    <ReactMarkdown
                      components={{
                        p: ({ children }) => (
                          <p className="mb-2 last:mb-0">{children}</p>
                        ),
                        ul: ({ children }) => (
                          <ul className="mb-2 pl-4 list-disc">{children}</ul>
                        ),
                        ol: ({ children }) => (
                          <ol className="mb-2 pl-4 list-decimal">{children}</ol>
                        ),
                        li: ({ children }) => (
                          <li className="mb-1">{children}</li>
                        ),
                        code: ({ children, className }) => {
                          const isInline = !className?.includes('language-');
                          return isInline ? (
                            <code className="bg-gray-200 px-1 py-0.5 rounded text-xs font-mono">
                              {children}
                            </code>
                          ) : (
                            <pre className="bg-gray-200 p-2 rounded mt-2 mb-2 overflow-x-auto">
                              <code className="text-xs font-mono">
                                {children}
                              </code>
                            </pre>
                          );
                        },
                        strong: ({ children }) => (
                          <strong className="font-semibold">{children}</strong>
                        ),
                        em: ({ children }) => (
                          <em className="italic">{children}</em>
                        ),
                        h1: ({ children }) => (
                          <h1 className="text-lg font-bold mb-2">{children}</h1>
                        ),
                        h2: ({ children }) => (
                          <h2 className="text-base font-bold mb-2">
                            {children}
                          </h2>
                        ),
                        h3: ({ children }) => (
                          <h3 className="text-sm font-bold mb-1">{children}</h3>
                        ),
                        blockquote: ({ children }) => (
                          <blockquote className="border-l-4 border-gray-300 pl-3 mb-2 italic text-gray-600">
                            {children}
                          </blockquote>
                        ),
                      }}
                    >
                      {message.content || ''}
                    </ReactMarkdown>

                    {isLoading &&
                      messages[messages.length - 1]?.id === message.id && (
                        <div className="flex justify-start mb-2">
                          <div className="flex gap-1">
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.1s]"></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                          </div>
                        </div>
                      )}
                  </div>
                ) : (
                  <p className="text-sm whitespace-pre-wrap">
                    {message.content}
                  </p>
                )}

                <div className="flex items-center justify-between mt-1">
                  <div className="text-xs opacity-70">
                    {message.timestamp.toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>

                  <div className="flex items-center gap-2">
                    {message.usedTools && message.usedTools.length > 0 && (
                      <span className="text-xs text-green-600 flex items-center gap-1">
                        <IconTool className="h-3 w-3" />
                        {message.usedTools.length} tools
                      </span>
                    )}

                    {message.ragUsed && (
                      <span className="text-xs text-purple-600 flex items-center gap-1">
                        <IconSearch className="h-3 w-3" />
                        RAG search
                      </span>
                    )}
                  </div>
                </div>
              </div>
              {message.role === 'user' && (
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                    <IconUser className="h-4 w-4 text-gray-600" />
                  </div>
                </div>
              )}
            </div>

            {/* RAG Usage Info */}
            {message.ragUsed && (
              <div className="mt-2 ml-11 bg-purple-50 rounded-lg p-3">
                <h4 className="text-xs font-semibold text-purple-900 mb-2 flex items-center gap-1">
                  <IconSearch className="h-3 w-3" />
                  RAG Search Information
                </h4>
                <div className="space-y-1">
                  <p className="text-xs text-gray-600">
                    Search Query:{' '}
                    <span className="font-medium">
                      {message.ragUsed.searchQuery}
                    </span>
                  </p>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-gray-600">
                      Documents Found:{' '}
                      <span className="font-medium">
                        {message.ragUsed.documentsFound}
                      </span>
                    </p>
                    {message.sources && message.sources.length > 0 && (
                      <button
                        onClick={() => toggleSources(message.id)}
                        className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1"
                      >
                        <IconExternalLink className="h-3 w-3" />
                        {message.sources.length} sources
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Sources Details */}
            {message.sources &&
              message.sources.length > 0 &&
              showSources === message.id && (
                <div className="mt-2 ml-11 bg-blue-50 rounded-lg p-3">
                  <h4 className="text-xs font-semibold text-blue-900 mb-2">
                    Referenced Wiki Documents
                  </h4>
                  <div className="space-y-2">
                    {message.sources.map((source, index) => (
                      <div
                        key={`${source.wikiId}-${index}`}
                        className="bg-white rounded p-2 border border-blue-200"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <button
                            onClick={() => handleWikiNavigation(source.wikiId)}
                            className="text-xs font-medium text-blue-900 hover:text-blue-700 hover:underline cursor-pointer transition-colors duration-200 text-left"
                          >
                            {source.title}
                          </button>
                          <span className="text-xs text-blue-600">
                            {(source.score * 100).toFixed(0)}% relevant
                          </span>
                        </div>
                        <p className="text-xs text-gray-600 mb-1">
                          School: {source.school}
                          {source.author && ` • Author: ${source.author}`}
                        </p>
                        <p className="text-xs text-gray-700">
                          {source.content.length > 100
                            ? `${source.content.substring(0, 100)}...`
                            : source.content}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            {/* Used Tools */}
            {message.usedTools && message.usedTools.length > 0 && (
              <div className="mt-2 ml-11 bg-green-50 rounded-lg p-3">
                <h4 className="text-xs font-semibold text-green-900 mb-2 flex items-center gap-1">
                  <IconTool className="h-3 w-3" />
                  AI Agent Tools Used
                </h4>
                <div className="space-y-2">
                  {message.usedTools.map((tool, index) => (
                    <div
                      key={`${tool.name}-${index}`}
                      className={`bg-white rounded p-2 border ${
                        tool.success ? 'border-green-200' : 'border-red-200'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span
                          className={`text-xs font-medium ${
                            tool.success ? 'text-green-900' : 'text-red-900'
                          }`}
                        >
                          {tool.name}
                        </span>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full ${
                            tool.success
                              ? 'bg-green-100 text-green-700'
                              : 'bg-red-100 text-red-700'
                          }`}
                        >
                          {tool.success ? 'Success' : 'Failed'}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 mb-1">
                        {tool.description}
                      </p>
                      {tool.args && Object.keys(tool.args).length > 0 && (
                        <details className="text-xs text-gray-700">
                          <summary className="cursor-pointer font-medium mb-1">
                            Arguments
                          </summary>
                          <pre className="bg-gray-100 p-1 rounded overflow-x-auto">
                            {JSON.stringify(tool.args, null, 2)}
                          </pre>
                        </details>
                      )}
                      {tool.result && (
                        <details className="text-xs text-gray-700 mt-1">
                          <summary className="cursor-pointer font-medium mb-1">
                            Result
                          </summary>
                          <pre className="bg-gray-100 p-1 rounded overflow-x-auto max-h-20">
                            {typeof tool.result === 'string'
                              ? tool.result
                              : JSON.stringify(tool.result, null, 2)}
                          </pre>
                        </details>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center gap-2 border border-gray-300 rounded-lg px-3 py-2 focus-within:ring-2 focus-within:ring-primary focus-within:border-transparent">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            className="flex-1 resize-none text-sm focus:outline-none min-h-[24px] max-h-[120px] py-1"
            rows={1}
          />
          <button
            onClick={handleSendMessage}
            disabled={!input.trim() || isLoading}
            title="Send Message"
            type="button"
            aria-label="Send message"
            className="p-1 hover:text-primary transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center flex-shrink-0"
          >
            <IconSend className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default AIPopupWithRAG;
