import type { NavigateOptions, ToOptions } from '@tanstack/react-router';

export interface NavigationFunction {
  (options: ToOptions & NavigateOptions): void;
}

export interface NavigationTool {
  navigateToPage: NavigationFunction;
}

// Available pages in the application
export const AVAILABLE_PAGES = {
  // Main pages
  home: '/',
  wiki: '/wiki',
  dorm: '/dorm',
  admin: '/admin',
  documentParsing: '/document-parsing',

  // Auth pages
  signIn: '/auth/sign-in',
  signUp: '/auth/sign-up',
  verification: '/auth/verification',
  googleCallback: '/auth/google/callback',

  // Wiki pages
  wikiHome: '/wiki/',
  wikiArticle: '/wiki/$wikiId', // requires wikiId parameter
  wikiEdit: '/wiki/$wikiId/edit', // requires wikiId parameter
  wikiHistory: '/wiki/$wikiId/history', // requires wikiId parameter

  // Dorm pages
  dormHome: '/dorm/',
  dormRetirementForm: '/dorm/retirement-form',
  dormRetirementMaintenance: '/dorm/retirement-maintenance',
  dormWarehouse: '/dorm/warehouse/',
  dormWarehouseForm: '/dorm/warehouse/form',

  // Admin pages
  adminDormCheck: '/admin/dorm-check',
  adminDormStorage: '/admin/dorm-storage',
  adminSchoolCertificate: '/admin/school-certificate',
} as const;

export type AvailablePageKey = keyof typeof AVAILABLE_PAGES;
export type AvailablePagePath = (typeof AVAILABLE_PAGES)[AvailablePageKey];

// Helper function to get page description for AI
export const getPageDescription = (pageKey: AvailablePageKey): string => {
  const descriptions: Record<AvailablePageKey, string> = {
    home: 'Main home page of Campass',
    wiki: 'Wiki main page with articles list',
    dorm: 'Dormitory services main page',
    admin: 'Admin dashboard for administrators',
    documentParsing: 'Document parsing and AI analysis tools',
    signIn: 'User sign in page',
    signUp: 'User registration page',
    verification: 'Account verification page',
    googleCallback: 'Google OAuth callback page',
    wikiHome: 'Wiki homepage with article categories',
    wikiArticle: 'Specific wiki article page (requires article ID)',
    wikiEdit: 'Edit wiki article page (requires article ID)',
    wikiHistory: 'View wiki article edit history (requires article ID)',
    dormHome: 'Dormitory services homepage',
    dormRetirementForm: 'Dormitory retirement application form',
    dormRetirementMaintenance: 'Dormitory retirement and maintenance page',
    dormWarehouse: 'Dormitory warehouse/storage management',
    dormWarehouseForm: 'Dormitory warehouse request form',
    adminDormCheck: 'Admin page for dormitory inspections',
    adminDormStorage: 'Admin page for dormitory storage management',
    adminSchoolCertificate: 'Admin page for school certificate verification',
  };

  return descriptions[pageKey];
};

// Helper function to validate if page requires parameters
export const pageRequiresParams = (pageKey: AvailablePageKey): boolean => {
  return ['wikiArticle', 'wikiEdit', 'wikiHistory'].includes(pageKey);
};

// Helper function to get available pages list for AI
export const getAvailablePagesList = (): Array<{
  key: AvailablePageKey;
  path: AvailablePagePath;
  description: string;
  requiresParams: boolean;
}> => {
  return Object.entries(AVAILABLE_PAGES).map(([key, path]) => ({
    key: key as AvailablePageKey,
    path,
    description: getPageDescription(key as AvailablePageKey),
    requiresParams: pageRequiresParams(key as AvailablePageKey),
  }));
};
