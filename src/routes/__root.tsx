import { useEffect, useState } from 'react';

import type { QueryClient } from '@tanstack/react-query';
import { Outlet, createRootRouteWithContext } from '@tanstack/react-router';

import AIFab from '../components/ai-fab';
import AIPopupWithRAG from '../components/ai-popup-with-rag';

interface MyRouterContext {
  queryClient: QueryClient;
}

function RootComponent() {
  const [isAIPopupOpen, setIsAIPopupOpen] = useState(false);

  const toggleAIPopup = () => {
    setIsAIPopupOpen(!isAIPopupOpen);
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isAIPopupOpen) {
        setIsAIPopupOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isAIPopupOpen]);

  return (
    <>
      <Outlet />
      {/* AI FAB with integrated Function Calling */}
      <AIFab isOpen={isAIPopupOpen} onClick={toggleAIPopup} />
      <AIPopupWithRAG isOpen={isAIPopupOpen} />
    </>
  );
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  component: RootComponent,
});
