import { createFileRoute } from '@tanstack/react-router';

import { AdminHomePage } from '@/pages/admin/admin-home-page';

export const Route = createFileRoute('/_admin-required/admin/')({
  component: AdminHomePage,
});
