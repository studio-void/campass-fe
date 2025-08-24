import { createFileRoute } from '@tanstack/react-router';

import RetirementMaintenancePage from '@/pages/dorm/check-maintenance';

export const Route = createFileRoute('/dorm/check-maintenance')({
  component: RetirementMaintenancePage,
});
