import { forwardRef } from 'react';

import { Link } from '@tanstack/react-router';

import { Button } from './ui/button';

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
        </div>
        <div className="flex-grow" />
        <div className="flex items-center gap-12 text-sm">
          <Link
            to="/"
            className="hover:font-semibold transition-all relative after:content-[''] after:block after:h-[2px] after:bg-current after:w-0 hover:after:w-full after:transition-all after:duration-300 after:absolute after:left-0 after:-bottom-1 after:origin-left dark:text-neutral-50"
          >
            About
          </Link>
          <Link
            to="/"
            className="hover:font-semibold transition-all relative after:content-[''] after:block after:h-[2px] after:bg-current after:w-0 hover:after:w-full after:transition-all after:duration-300 after:absolute after:left-0 after:-bottom-1 after:origin-left dark:text-neutral-50"
          >
            Dormitory
          </Link>
          <Link
            to="/"
            className="hover:font-semibold transition-all relative after:content-[''] after:block after:h-[2px] after:bg-current after:w-0 hover:after:w-full after:transition-all after:duration-300 after:absolute after:left-0 after:-bottom-1 after:origin-left dark:text-neutral-50"
          >
            Research
          </Link>
          <Link
            to="/"
            className="hover:font-semibold transition-all relative after:content-[''] after:block after:h-[2px] after:bg-current after:w-0 hover:after:w-full after:transition-all after:duration-300 after:absolute after:left-0 after:-bottom-1 after:origin-left dark:text-neutral-50"
          >
            Team Project
          </Link>
          <Link
            to="/"
            className="hover:font-semibold transition-all relative after:content-[''] after:block after:h-[2px] after:bg-current after:w-0 hover:after:w-full after:transition-all after:duration-300 after:absolute after:left-0 after:-bottom-1 after:origin-left dark:text-neutral-50"
          >
            Facility
          </Link>
          <Link
            to="/"
            className="hover:font-semibold transition-all relative after:content-[''] after:block after:h-[2px] after:bg-current after:w-0 hover:after:w-full after:transition-all after:duration-300 after:absolute after:left-0 after:-bottom-1 after:origin-left dark:text-neutral-50"
          >
            Timetable
          </Link>
          <Link
            to="/"
            className="hover:font-semibold transition-all relative after:content-[''] after:block after:h-[2px] after:bg-current after:w-0 hover:after:w-full after:transition-all after:duration-300 after:absolute after:left-0 after:-bottom-1 after:origin-left dark:text-neutral-50"
          >
            Wiki
          </Link>
          <Link to="/">
            <Button variant="default" className="font-semibold">
              Get Started
            </Button>
          </Link>
        </div>
      </nav>
    </header>
  );
});
