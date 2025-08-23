import { useEffect, useState } from 'react';

import { type GetUserResponse, getUser } from '@/data/get-user';

export function useCurrentUser() {
  const [user, setUser] = useState<GetUserResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await getUser();
        setUser(userData || null);
        setError(null);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to load user data',
        );
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  const refetch = async () => {
    setLoading(true);
    try {
      const userData = await getUser();
      setUser(userData || null);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load user data');
    } finally {
      setLoading(false);
    }
  };

  return {
    user,
    loading,
    error,
    refetch,
    isAuthenticated: !!user,
    isAdmin: user?.isAdmin || false,
  };
}
