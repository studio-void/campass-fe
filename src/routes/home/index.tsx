import { createFileRoute } from '@tanstack/react-router';

import DashboardPage from '@/pages/home/dashboard-page';

export const Route = createFileRoute('/home/')({
  component: DashboardPage,
});
