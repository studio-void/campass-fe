import { useEffect, useMemo } from 'react';

import { useQuery } from '@tanstack/react-query';

import { deleteAuthLogout } from '@/data/delete-auth-logout';
import { getUser } from '@/data/get-user';

import { useToken } from './use-token';

export const useAuth = () => {
  const { token } = useToken();
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['user'],
    queryFn: getUser,
    enabled: !!token,
  });

  const user = useMemo(() => {
    if (!token) return null;
    if (isLoading) return undefined;
    if (error) return null;
    return data;
  }, [data, error, isLoading, token]);

  useEffect(() => {
    if (token) refetch();
  }, [token, refetch]);

  return { user, refetch, logout: deleteAuthLogout };
};
