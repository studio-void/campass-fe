import type { NavigateOptions, ToOptions } from '@tanstack/react-router';

import { AVAILABLE_PAGES, getAvailablePagesList } from '../utils/navigation';

export interface NavigationToolResult {
  success: boolean;
  message: string;
  navigatedTo?: string;
  error?: string;
}

export interface NavigationParams {
  page?: string;
  wikiId?: string;
  [key: string]: string | undefined;
}

export class NavigationTool {
  private navigate: (options: ToOptions & NavigateOptions) => void;

  constructor(navigate: (options: ToOptions & NavigateOptions) => void) {
    this.navigate = navigate;
  }

  /**
   * Navigate to a specific page in the application
   * @param params Navigation parameters
   * @returns Result of the navigation attempt
   */
  async navigateToPage(
    params: NavigationParams,
  ): Promise<NavigationToolResult> {
    try {
      const { page, wikiId, ...otherParams } = params;

      if (!page) {
        return {
          success: false,
          message: 'Page parameter is required',
          error: 'Missing page parameter',
        };
      }

      // Find the page in available pages
      const pageEntry = Object.entries(AVAILABLE_PAGES).find(
        ([key, path]) => key === page || path === page,
      );

      if (!pageEntry) {
        const availablePages = getAvailablePagesList()
          .map((p) => `${p.key} (${p.path})`)
          .join(', ');

        return {
          success: false,
          message: `Page '${page}' not found. Available pages: ${availablePages}`,
          error: 'Invalid page',
        };
      }

      const [pageKey, pagePath] = pageEntry;

      // Handle pages that require parameters
      if (pagePath.includes('$wikiId')) {
        if (!wikiId) {
          return {
            success: false,
            message: `Page '${pageKey}' requires wikiId parameter`,
            error: 'Missing required parameter: wikiId',
          };
        }

        this.navigate({
          to: pagePath as any,
          params: { wikiId },
        });

        return {
          success: true,
          message: `Successfully navigated to ${pageKey} with wikiId: ${wikiId}`,
          navigatedTo: `${pagePath.replace('$wikiId', wikiId)}`,
        };
      }

      // Handle regular pages
      this.navigate({
        to: pagePath as any,
        ...(Object.keys(otherParams).length > 0 && { search: otherParams }),
      });

      return {
        success: true,
        message: `Successfully navigated to ${pageKey}`,
        navigatedTo: pagePath,
      };
    } catch (error) {
      return {
        success: false,
        message: `Navigation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Get list of available pages that can be navigated to
   * @returns List of available pages with descriptions
   */
  getAvailablePages(): Array<{
    key: string;
    path: string;
    description: string;
    requiresParams: boolean;
    requiredParams?: string[];
  }> {
    return getAvailablePagesList().map((page) => ({
      ...page,
      requiredParams: page.requiresParams ? ['wikiId'] : undefined,
    }));
  }

  /**
   * Search for pages by keyword
   * @param keyword Search keyword
   * @returns Matching pages
   */
  searchPages(keyword: string): Array<{
    key: string;
    path: string;
    description: string;
    relevance: number;
  }> {
    const pages = getAvailablePagesList();
    const searchTerm = keyword.toLowerCase();

    return pages
      .map((page) => {
        let relevance = 0;

        // Exact key match
        if (page.key.toLowerCase() === searchTerm) {
          relevance = 100;
        }
        // Key contains search term
        else if (page.key.toLowerCase().includes(searchTerm)) {
          relevance = 80;
        }
        // Description contains search term
        else if (page.description.toLowerCase().includes(searchTerm)) {
          relevance = 60;
        }
        // Path contains search term
        else if (page.path.toLowerCase().includes(searchTerm)) {
          relevance = 40;
        }

        return {
          key: page.key,
          path: page.path,
          description: page.description,
          relevance,
        };
      })
      .filter((page) => page.relevance > 0)
      .sort((a, b) => b.relevance - a.relevance);
  }
}
