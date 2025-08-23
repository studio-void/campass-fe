import { createFileRoute } from '@tanstack/react-router';

import { SchoolCertificatePage } from '@/pages/admin/school-certificate-page';

export const Route = createFileRoute('/admin/school-certificate')({
  component: SchoolCertificatePage,
});
