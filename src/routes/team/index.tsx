import { createFileRoute } from '@tanstack/react-router';

import TeamProjectIndexPage from '@/pages/team';

export const Route = createFileRoute('/team/')({
  component: TeamProjectIndexPage,
});
