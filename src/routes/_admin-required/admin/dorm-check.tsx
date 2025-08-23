import { createFileRoute } from '@tanstack/react-router';

import { DormCheckPage } from '@/pages/admin/dorm-check-page';

export const Route = createFileRoute('/_admin-required/admin/dorm-check')({
  component: DormCheckPage,
});
