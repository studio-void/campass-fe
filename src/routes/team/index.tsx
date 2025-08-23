import { createFileRoute } from '@tanstack/react-router';

import Page from '@/pages/home/dashboard-page';

export const Route = createFileRoute('/team/')({
  component: Page,
});
