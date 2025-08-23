import { useEffect, useState } from 'react';

import { Outlet } from '@tanstack/react-router';

import { Layout, UserSchoolLogo } from '@/components';
import { School, getUserSchool } from '@/data/get-user';

function WikiLayout() {
  const [school, setSchool] = useState<School | undefined>(undefined);

  useEffect(() => {
    getUserSchool().then(setSchool);
  }, []);

  return (
    <Layout>
      <div className="flex flex-col w-full">
        <div className="flex items-center">
          {school && <UserSchoolLogo school={school} size="2xl" />}
          <span className="ml-2 text-2xl font-semibold text-neutral-500">
            Campus Wiki
          </span>
        </div>
        <p className="mt-2 text-primary text-lg font-semibold mb-4">
          Make campus life more convenient
        </p>

        <Outlet />
      </div>
    </Layout>
  );
}

export default WikiLayout;
