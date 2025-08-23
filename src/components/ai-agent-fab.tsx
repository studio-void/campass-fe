import { useState } from 'react';

import { Bot } from 'lucide-react';

import { AIAgentPopup } from './ai-agent-popup';

export function AIAgentFAB() {
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsPopupOpen(true)}
        className="fixed bottom-6 right-20 w-14 h-14 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 z-40 flex items-center justify-center"
        aria-label="Open AI Agent"
      >
        <Bot size={24} />
      </button>

      <AIAgentPopup
        isOpen={isPopupOpen}
        onClose={() => setIsPopupOpen(false)}
      />
    </>
  );
}
