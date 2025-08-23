import { useRef } from 'react';
import type { PropsWithChildren } from 'react';

// import { Footer } from './footer';
import { Header } from './header';

export const Layout: React.FC<
  PropsWithChildren<{ disableHeaderHeight?: boolean }>
> = ({ children, disableHeaderHeight }) => {
  const headerRef = useRef<HTMLElementTagNameMap['header']>(null);

  return (
    <div className="min-h-screen w-full">
      <Header ref={headerRef} />

      <main
        className={`flex flex-col items-center mx-6 md:mx-12 lg:mx-24 xl:mx-48 ${disableHeaderHeight ? '' : 'pt-20'}`}
      >
        {children}
      </main>
      {/* <Footer /> */}
    </div>
  );
};
