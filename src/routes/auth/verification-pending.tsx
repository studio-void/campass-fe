import { createFileRoute } from '@tanstack/react-router';

import VerificationPendingPage from '@/pages/auth/verification-pending';

export const Route = createFileRoute('/auth/verification-pending')({
  component: VerificationPendingPage,
});
