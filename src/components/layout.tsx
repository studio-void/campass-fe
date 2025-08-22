import { useEffect, useRef, useState } from 'react';
import type { PropsWithChildren } from 'react';

import AIFab from './ai-fab';
import AIPopup from './ai-popup';
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
      <AIPopup isOpen={isAIPopupOpen} />
      <main
        className={`px-4 sm:px-6 lg:px-8 ${disableHeaderHeight ? '' : 'pt-16'}`}
      >
        {children}
      </main>
      {/* <Footer /> */}
    </div>
  );
};
