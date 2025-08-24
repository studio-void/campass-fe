import { forwardRef } from 'react';

import { Link, useLocation } from '@tanstack/react-router';

import { useAuth } from '@/hooks';
import { cn } from '@/utils/cn';

import { Button } from './ui/button';

const PRIMARY = 'text-blue-600 dark:text-blue-400 after:bg-blue-600';
const BASE =
  'transition-colors relative after:content-[""] after:block after:h-[2px] after:absolute after:left-0 after:-bottom-1 after:origin-left dark:text-neutral-50';

export const Header = forwardRef<
  HTMLElementTagNameMap['header'],
  React.HTMLAttributes<HTMLElementTagNameMap['header']>
>((_, ref) => {
  const { user } = useAuth();
  const location = useLocation();
  const pathname = location.pathname;

  return (
    <header
      ref={ref}
      className="backdrop-blur-lg fixed top-0 left-0 w-full z-50"
    >
      <nav className="mx-6 md:mx-12 lg:mx-24 xl:mx-48 py-4 flex flex-row items-center">
        <div className="font-bold">
          <Link to="/">
            <img
              src="/images/campass_wordmark.svg"
              alt="Campass Logo"
              className="h-8"
            />
          </Link>
        </div>
        <div className="flex-grow" />
        <div className="flex items-center gap-12 text-sm">
          <Link
            to="/dorm"
            className={cn(
              BASE,
              pathname.startsWith('/dorm')
                ? ['font-bold', PRIMARY, 'after:w-full']
                : ['hover:text-blue-600 hover:dark:text-blue-400', 'after:w-0'],
            )}
          >
            Dormitory
          </Link>
          <Link
            to="/team"
            className={cn(
              BASE,
              pathname === '/team'
                ? ['font-bold', PRIMARY, 'after:w-full']
                : ['hover:text-blue-600 hover:dark:text-blue-400', 'after:w-0'],
            )}
          >
            Team Project
          </Link>
          {/* <Link
            to="/"
            className={cn(
              BASE,
              pathname === '/'
                ? ['font-bold', PRIMARY, 'after:w-full']
                : ['hover:text-blue-600 hover:dark:text-blue-400', 'after:w-0'],
            )}
          >
            Timetable
          </Link> */}
          <Link
            to="/wiki"
            className={cn(
              BASE,
              pathname.startsWith('/wiki')
                ? ['font-bold', PRIMARY, 'after:w-full']
                : ['hover:text-blue-600 hover:dark:text-blue-400', 'after:w-0'],
            )}
          >
            Wiki
          </Link>
          <div className="flex items-center gap-4">
            {user?.isAdmin && (
              <Link to="/admin">
                <Button variant="outline" className="font-semibold">
                  Admin
                </Button>
              </Link>
            )}
            {user ? (
              <Link to="/home">
                <Button variant="default" className="font-semibold">
                  My Page
                </Button>
              </Link>
            ) : (
              <Link to="/auth/sign-in">
                <Button variant="default" className="font-semibold">
                  Get Started
                </Button>
              </Link>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
});
