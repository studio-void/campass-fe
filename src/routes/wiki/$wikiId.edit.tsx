import { createFileRoute } from '@tanstack/react-router';

import WikiEditPage from '@/pages/wiki/wiki-edit';

export const Route = createFileRoute('/wiki/$wikiId/edit')({
  component: WikiEditPage,
});
