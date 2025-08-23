import { createFileRoute } from '@tanstack/react-router';

import VerificationPage from '@/pages/auth/verification';

export const Route = createFileRoute('/auth/verification')({
  component: VerificationPage,
});
