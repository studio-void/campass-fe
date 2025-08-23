import { Navigate, Outlet, createFileRoute } from '@tanstack/react-router';

import { useAuth } from '@/hooks';

export const Route = createFileRoute('/admin')({
  component: RouteComponent,
});

function RouteComponent() {
  const { user } = useAuth();

  if (!user) return <Navigate to="/" replace />;
  if (!user.isAdmin) return <Navigate to="/" replace />;
  return <Outlet />;
}
