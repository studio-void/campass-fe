import { Outlet } from '@tanstack/react-router';

import { Layout, UserSchoolLogo } from '@/components';
import { useAuth } from '@/hooks';

function WikiLayout() {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <Layout>
      <div className="flex flex-col w-full">
        <div className="flex items-center">
          {user.school && <UserSchoolLogo school={user.school} size="2xl" />}
          <span className="ml-2 text-2xl font-semibold text-neutral-500">
            Campus Wiki
          </span>
        </div>
        <p className="mt-2 text-primary text-lg font-semibold mb-4">
          Share knowledge and make campus life easier
        </p>

        <Outlet />
      </div>
    </Layout>
  );
}

export default WikiLayout;
