import { createFileRoute } from '@tanstack/react-router';

import WikiIndexPage from '@/pages/wiki/wiki-index';

export const Route = createFileRoute('/wiki/')({
  component: WikiIndexPage,
});
