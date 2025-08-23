import { createFileRoute } from '@tanstack/react-router';

import RetirementFormPage from '@/pages/dorm/retirement-form';

export const Route = createFileRoute('/dorm/retirement-form')({
  component: RetirementFormPage,
});
