import { Navigate, Outlet, createFileRoute } from '@tanstack/react-router';

import { useAuth } from '@/hooks';

export const Route = createFileRoute('/_admin-required')({
  component: RouteComponent,
});

function RouteComponent() {
  const { user } = useAuth();

  if (user === undefined) return null;
  if (user === null) return <Navigate to="/" replace />;
  if (user && !user.isAdmin) return <Navigate to="/" replace />;
  return <Outlet />;
}
