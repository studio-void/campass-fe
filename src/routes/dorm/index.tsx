import { createFileRoute } from '@tanstack/react-router';

import DormIndexPageUI from '@/pages/dorm/dorm-index';

export const Route = createFileRoute('/dorm/')({
  component: () => <DormIndexPageUI />,
});
