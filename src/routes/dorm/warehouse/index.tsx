import { createFileRoute } from '@tanstack/react-router';

import WarehouseUseIntroPage from '@/pages/dorm/warehouse-use';

export const Route = createFileRoute('/dorm/warehouse/')({
  component: WarehouseUseIntroPage,
});
