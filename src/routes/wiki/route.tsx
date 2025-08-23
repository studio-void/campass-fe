import { createFileRoute } from '@tanstack/react-router';

import WikiLayout from '@/pages/wiki/wiki-layout';

export const Route = createFileRoute('/wiki')({
  component: WikiLayout,
});
