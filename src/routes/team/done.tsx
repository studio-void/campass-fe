import { createFileRoute } from '@tanstack/react-router';

import Page from '@/pages/team/done';

export const Route = createFileRoute('/team/done')({
  component: Page,
});
