import { useEffect, useRef, useState } from 'react';
import type { PropsWithChildren } from 'react';

import AIFab from './ai-fab';
import AIPopupWithRAG from './ai-popup-with-rag';
// import { Footer } from './footer';
import { Header } from './header';

export const Layout: React.FC<
  PropsWithChildren<{ disableHeaderHeight?: boolean }>
> = ({ children, disableHeaderHeight }) => {
  const headerRef = useRef<HTMLElementTagNameMap['header']>(null);
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
    <div className="min-h-screen w-full">
      <Header ref={headerRef} />
      <AIFab isOpen={isAIPopupOpen} onClick={toggleAIPopup} />
      <AIPopupWithRAG isOpen={isAIPopupOpen} />
      <main
        className={`flex flex-col items-center mx-6 md:mx-12 lg:mx-24 xl:mx-48 ${disableHeaderHeight ? '' : 'pt-20'}`}
      >
        {children}
      </main>
      {/* <Footer /> */}
    </div>
  );
};
