import { createFileRoute } from '@tanstack/react-router';

import RetirementMaintenancePage from '@/pages/dorm/retirement-maintenance';

export const Route = createFileRoute('/dorm/retirement-maintenance')({
  component: RetirementMaintenancePage,
});
