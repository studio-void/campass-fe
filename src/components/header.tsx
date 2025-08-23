import { forwardRef, useEffect, useState } from 'react';

import { Link } from '@tanstack/react-router';

import { deleteAuthLogout } from '@/data/delete-auth-logout';

import { Button } from './ui/button';

export const Header = forwardRef<
  HTMLElementTagNameMap['header'],
  React.HTMLAttributes<HTMLElementTagNameMap['header']>
>((_, ref) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Function to update state from localStorage
    const updateAuthState = () => {
      const loggedIn = localStorage.getItem('isLoggedIn') === 'true';
      const admin = localStorage.getItem('isAdmin') === 'true';

      setIsLoggedIn(loggedIn);
      setIsAdmin(admin);
    };

    // Initial check
    updateAuthState();

    // Listen for storage changes (when other tabs/windows update localStorage)
    window.addEventListener('storage', updateAuthState);

    // Listen for custom events (when same tab updates localStorage)
    window.addEventListener('authStateChanged', updateAuthState);

    return () => {
      window.removeEventListener('storage', updateAuthState);
      window.removeEventListener('authStateChanged', updateAuthState);
    };
  }, []);
  const handleLogout = async () => {
    await deleteAuthLogout();
  };

  const getAuthButton = () => {
    if (!isLoggedIn) {
      return (
        <Link to="/auth/sign-in">
          <Button variant="default" className="font-semibold">
            Get Started
          </Button>
        </Link>
      );
    }

    // If logged in, show the main button only
    return isAdmin ? (
      <Link to="/admin/school-certificate">
        <Button variant="default" className="font-semibold">
          Dashboard
        </Button>
      </Link>
    ) : (
      <Link to="/">
        <Button variant="default" className="font-semibold">
          My Page
        </Button>
      </Link>
    );
  };

  return (
    <header
      ref={ref}
      className="bg-white/20 dark:bg-black/20 backdrop-blur-lg border-b border-white/30 dark:border-black/30 fixed top-0 left-0 w-full z-50"
    >
      <nav className="mx-6 md:mx-12 lg:mx-24 xl:mx-48 py-4 flex flex-row items-center">
        <div className="font-bold">
          <Link to="/home">
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
            to="/home"
            preload="intent"
            className="hover:font-semibold transition-all relative after:content-[''] after:block after:h-[2px] after:bg-current after:w-0 hover:after:w-full after:transition-all after:duration-300 after:absolute after:left-0 after:-bottom-1 after:origin-left dark:text-neutral-50"
          >
            My page
          </Link>

          <Link
            to="/dorm"
            preload="intent"
            className="hover:font-semibold transition-all relative after:content-[''] after:block after:h-[2px] after:bg-current after:w-0 hover:after:w-full after:transition-all after:duration-300 after:absolute after:left-0 after:-bottom-1 after:origin-left dark:text-neutral-50"
          >
            Dormitory
          </Link>

          {/* 아직 경로 없으면 임시로 /home 이나 숨김 처리 */}
          <Link
            to="/home"
            className="hover:font-semibold transition-all relative after:content-[''] after:block after:h-[2px] after:bg-current after:w-0 hover:after:w-full after:transition-all after:duration-300 after:absolute after:left-0 after:-bottom-1 after:origin-left dark:text-neutral-50"
          >
            Research
          </Link>
          <Link
            to="/home"
            className="hover:font-semibold transition-all relative after:content-[''] after:block after:h-[2px] after:bg-current after:w-0 hover:after:w-full after:transition-all after:duration-300 after:absolute after:left-0 after:-bottom-1 after:origin-left dark:text-neutral-50"
          >
            Team Project
          </Link>
          <Link
            to="/home"
            className="hover:font-semibold transition-all relative after:content-[''] after:block after:h-[2px] after:bg-current after:w-0 hover:after:w-full after:transition-all after:duration-300 after:absolute after:left-0 after:-bottom-1 after:origin-left dark:text-neutral-50"
          >
            Facility
          </Link>
          <Link
            to="/home"
            className="hover:font-semibold transition-all relative after:content-[''] after:block after:h-[2px] after:bg-current after:w-0 hover:after:w-full after:transition-all after:duration-300 after:absolute after:left-0 after:-bottom-1 after:origin-left dark:text-neutral-50"
          >
            Timetable
          </Link>

          <Link
            to="/wiki"
            preload="intent"
            className="hover:font-semibold transition-all relative after:content-[''] after:block after:h-[2px] after:bg-current after:w-0 hover:after:w-full after:transition-all after:duration-300 after:absolute after:left-0 after:-bottom-1 after:origin-left dark:text-neutral-50"
          >
            Wiki
          </Link>

          <Button variant="default" className="font-semibold" asChild>
            <Link to="/auth/sign-in">Get Started</Link>
          </Button>
        </div>
      </nav>
    </header>
  );
});
