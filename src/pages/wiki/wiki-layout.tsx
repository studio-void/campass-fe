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
          {school ? (
            <UserSchoolLogo school={school} size="2xl" />
          ) : (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center animate-pulse">
                <span className="text-xs text-gray-400">?</span>
              </div>
              <div className="h-8 w-24 bg-gray-200 rounded animate-pulse" />
            </div>
          )}
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
