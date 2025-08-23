import { createFileRoute } from '@tanstack/react-router';

import WikiDetailPage from '@/pages/wiki/wiki-detail';

export const Route = createFileRoute('/wiki/$wikiId')({
  component: WikiDetailPage,
});