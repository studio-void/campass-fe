import { createFileRoute } from '@tanstack/react-router';

import WikiHistoryPage from '@/pages/wiki/wiki-history';

export const Route = createFileRoute('/wiki/$wikiId/history')({
  component: WikiHistoryPage,
});