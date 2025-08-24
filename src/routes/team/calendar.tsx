import { createFileRoute } from '@tanstack/react-router';

import Page from '@/pages/team/calendar';

type CalendarSearch = {
  team?: string;
  project?: string;
  count?: number;
  duration?: number;
};

export const Route = createFileRoute('/team/calendar')({
  component: Page,
  validateSearch: (s): CalendarSearch => s,
});
