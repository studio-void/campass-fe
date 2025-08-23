import { createFileRoute } from '@tanstack/react-router';

import Page from '@/pages/dorm/warehouse-form';

export const Route = createFileRoute('/dorm/warehouse/form')({
  component: Page,
});
