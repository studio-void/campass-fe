import { createFileRoute } from '@tanstack/react-router';

import Page from '@/pages/dorm/storage-form';

export const Route = createFileRoute('/dorm/storage/form')({
  component: Page,
});
