import * as React from 'react';

import { type VariantProps, cva } from 'class-variance-authority';

import { School } from '@/data/get-user';
import { cn } from '@/utils/index';

const userSchoolLogoVariants = cva(
  'inline-flex items-center justify-center gap-2 transition-colors',
  {
    variants: {
      size: {
        sm: 'text-sm',
        md: 'text-base',
        lg: 'text-lg',
        xl: 'text-xl',
        '2xl': 'text-2xl',
        '3xl': 'text-3xl',
        '4xl': 'text-4xl',
      },
      display: {
        'logo-only': 'gap-0',
        'logo-with-name': 'gap-2',
        'name-only': 'gap-0',
      },
    },
    defaultVariants: {
      size: 'md',
      display: 'logo-with-name',
    },
  },
);

interface SchoolInfo {
  name: string;
  logoUrl: string;
}

const schoolInfo: Record<School, SchoolInfo> = {
  [School.GIST]: {
    name: 'GIST',
    logoUrl: '/images/schools/gist.svg',
  },
  [School.POSTECH]: {
    name: 'POSTECH',
    logoUrl: '/images/schools/postech.png',
  },
  [School.KAIST]: {
    name: 'KAIST',
    logoUrl: '/images/schools/kaist.svg',
  },
};

const logoSizeMap = {
  sm: 16,
  md: 20,
  lg: 24,
  xl: 28,
  '2xl': 32,
  '3xl': 36,
  '4xl': 40,
};

export interface UserSchoolLogoProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof userSchoolLogoVariants> {
  school: School;
  showFallback?: boolean;
}

const UserSchoolLogo = React.forwardRef<HTMLDivElement, UserSchoolLogoProps>(
  (
    {
      className,
      size = 'md',
      display = 'logo-with-name',
      school,
      showFallback = true,
      ...props
    },
    ref,
  ) => {
    const info = schoolInfo[school];
    const logoSize = logoSizeMap[size || 'md'];

    if (!info) {
      if (showFallback) {
        return (
          <div
            ref={ref}
            className={cn(userSchoolLogoVariants({ size, display, className }))}
            {...props}
          >
            <div
              className={cn(
                'rounded-full bg-gray-200 flex items-center justify-center',
                size === 'sm' && 'w-4 h-4',
                size === 'md' && 'w-5 h-5',
                size === 'lg' && 'w-6 h-6',
                size === 'xl' && 'w-7 h-7',
                size === '2xl' && 'w-8 h-8',
                size === '3xl' && 'w-9 h-9',
                size === '4xl' && 'w-10 h-10',
              )}
            >
              <span className="text-xs text-gray-500">?</span>
            </div>
            {(display === 'logo-with-name' || display === 'name-only') && (
              <span className="text-gray-500">Unknown School</span>
            )}
          </div>
        );
      }
      return null;
    }

    return (
      <div
        ref={ref}
        className={cn(userSchoolLogoVariants({ size, display, className }))}
        {...props}
      >
        {(display === 'logo-only' || display === 'logo-with-name') && (
          <img
            src={info.logoUrl}
            alt={`${info.name} Logo`}
            width={logoSize}
            height={logoSize}
            className={cn(
              'object-contain',
              size === 'sm' && 'w-4 h-4',
              size === 'md' && 'w-5 h-5',
              size === 'lg' && 'w-6 h-6',
              size === 'xl' && 'w-7 h-7',
              size === '2xl' && 'w-8 h-8',
              size === '3xl' && 'w-9 h-9',
              size === '4xl' && 'w-10 h-10',
            )}
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              const parent = target.parentElement;
              if (parent && showFallback) {
                const fallback = document.createElement('div');
                fallback.className = cn(
                  'rounded-full bg-gray-200 flex items-center justify-center',
                  size === 'sm' && 'w-4 h-4',
                  size === 'md' && 'w-5 h-5',
                  size === 'lg' && 'w-6 h-6',
                  size === 'xl' && 'w-7 h-7',
                  size === '2xl' && 'w-8 h-8',
                  size === '3xl' && 'w-9 h-9',
                  size === '4xl' && 'w-10 h-10',
                );
                fallback.innerHTML =
                  '<span class="text-xs text-gray-500">?</span>';
                parent.insertBefore(fallback, target);
              }
            }}
          />
        )}
        {(display === 'logo-with-name' || display === 'name-only') && (
          <span
            className={cn(
              'font-semibold ml-1',
              size === 'sm' && 'text-sm',
              size === 'md' && 'text-base',
              size === 'lg' && 'text-lg',
              size === 'xl' && 'text-xl',
              size === '2xl' && 'text-2xl',
              size === '3xl' && 'text-3xl',
              size === '4xl' && 'text-4xl',
            )}
          >
            {info.name}
          </span>
        )}
      </div>
    );
  },
);

UserSchoolLogo.displayName = 'UserSchoolLogo';

export { UserSchoolLogo, userSchoolLogoVariants };
