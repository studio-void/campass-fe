import { forwardRef } from 'react';

import { Link } from '@tanstack/react-router';

export const Header = forwardRef<
  HTMLElementTagNameMap['header'],
  React.HTMLAttributes<HTMLElementTagNameMap['header']>
>((_, ref) => {
  return (
    <header
      ref={ref}
      className="bg-white/20 dark:bg-black/20 backdrop-blur-lg border-b border-white/30 dark:border-black/30 fixed top-0 left-0 w-full z-50"
    >
      <nav className="mx-6 md:mx-12 lg:mx-24 xl:mx-48 py-4 flex flex-row items-center">
        <div className="px-2 font-bold">
          <Link to="/">
            <img
              src="/images/campass_wordmark.svg"
              alt="Campass Logo"
              className="h-8"
            />
          </Link>
          <div className="flex-grow" />
        </div>
      </nav>
    </header>
  );
});
