import { createFileRoute } from '@tanstack/react-router';

import CheckFormPage from '@/pages/dorm/check-form';

export const Route = createFileRoute('/dorm/check-form')({
  component: CheckFormPage,
});
