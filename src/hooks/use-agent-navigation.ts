import type { NavigateOptions, ToOptions } from '@tanstack/react-router';

import type {
  NavigationParams,
  NavigationToolResult,
} from './use-navigation-tool';
import { NavigationTool } from './use-navigation-tool';

/**
 * Creates navigation functions for AI agent use
 * @param navigate TanStack Router navigate function
 * @returns Object containing navigation functions
 */
export function createNavigationFunctions(
  navigate: (options: ToOptions & NavigateOptions) => void,
) {
  const navigationTool = new NavigationTool(navigate);

  return {
    /**
     * Navigate to a specific page
     * Usage examples:
     * - navigateToPage({ page: 'home' })
     * - navigateToPage({ page: 'wiki' })
     * - navigateToPage({ page: 'wikiArticle', wikiId: '123' })
     * - navigateToPage({ page: 'dorm' })
     * - navigateToPage({ page: 'admin' })
     */
    navigateToPage: async (
      params: NavigationParams,
    ): Promise<NavigationToolResult> => {
      return navigationTool.navigateToPage(params);
    },

    /**
     * Get list of all available pages
     * Returns array of page information including keys, paths, descriptions, and required parameters
     */
    getAvailablePages: () => {
      return navigationTool.getAvailablePages();
    },

    /**
     * Search for pages by keyword
     * Useful for finding pages when user asks to go to something like "dormitory" or "wiki"
     */
    searchPages: (keyword: string) => {
      return navigationTool.searchPages(keyword);
    },

    /**
     * Navigate to home page
     */
    goHome: async (): Promise<NavigationToolResult> => {
      return navigationTool.navigateToPage({ page: 'home' });
    },

    /**
     * Navigate to wiki main page
     */
    goToWiki: async (): Promise<NavigationToolResult> => {
      return navigationTool.navigateToPage({ page: 'wiki' });
    },

    /**
     * Navigate to a specific wiki article
     * @param wikiId ID of the wiki article
     */
    goToWikiArticle: async (wikiId: string): Promise<NavigationToolResult> => {
      return navigationTool.navigateToPage({ page: 'wikiArticle', wikiId });
    },

    /**
     * Navigate to dorm services
     */
    goToDorm: async (): Promise<NavigationToolResult> => {
      return navigationTool.navigateToPage({ page: 'dorm' });
    },

    /**
     * Navigate to admin panel
     */
    goToAdmin: async (): Promise<NavigationToolResult> => {
      return navigationTool.navigateToPage({ page: 'admin' });
    },

    /**
     * Navigate to document parsing page
     */
    goToDocumentParsing: async (): Promise<NavigationToolResult> => {
      return navigationTool.navigateToPage({ page: 'documentParsing' });
    },

    /**
     * Navigate to sign in page
     */
    goToSignIn: async (): Promise<NavigationToolResult> => {
      return navigationTool.navigateToPage({ page: 'signIn' });
    },

    /**
     * Navigate to sign up page
     */
    goToSignUp: async (): Promise<NavigationToolResult> => {
      return navigationTool.navigateToPage({ page: 'signUp' });
    },
  };
}

export type NavigationFunctions = ReturnType<typeof createNavigationFunctions>;
