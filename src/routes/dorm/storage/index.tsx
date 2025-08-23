import { createFileRoute } from '@tanstack/react-router';

import StorageUseIntroPage from '@/pages/dorm/storage-use';

export const Route = createFileRoute('/dorm/storage/')({
  component: StorageUseIntroPage,
});
