import { createFileRoute } from '@tanstack/react-router';

import { DormStoragePage } from '@/pages/admin/dorm-storage-page';

export const Route = createFileRoute('/admin/dorm-storage')({
  component: DormStoragePage,
});
