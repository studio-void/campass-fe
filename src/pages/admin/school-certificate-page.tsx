import { useEffect, useState } from 'react';

import { toast } from 'sonner';

import { Layout } from '@/components';
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  type GetUserVerifyResponse,
  getUserVerify,
} from '@/data/get-user-verify';

export const SchoolCertificatePage: React.FC = () => {
  const [users, setUsers] = useState<GetUserVerifyResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const userData = await getUserVerify();
        if (userData) {
          setUsers(userData);
          toast.success(`Successfully loaded ${userData.length} users`);
        } else {
          toast.warning('No user data found');
        }
      } catch (error) {
        console.error('Failed to fetch user verify data:', error);
        toast.error('Failed to load user verification data', {
          description: 'Please try refreshing the page',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-32">
          <p>Loading...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">No.</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Student ID</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>School</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Documents</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user, index) => (
            <TableRow key={user.id}>
              <TableCell className="font-medium">{index + 1}</TableCell>
              <TableCell>{user.name}</TableCell>
              <TableCell>{user.number || 'N/A'}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>{user.school}</TableCell>
              <TableCell>
                <span
                  className={`px-2 py-1 rounded-md text-xs font-medium ${
                    user.verifyStatus === 'VERIFIED'
                      ? 'bg-green-100 text-green-800'
                      : user.verifyStatus === 'PENDING'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {user.verifyStatus}
                </span>
              </TableCell>
              <TableCell className="text-right">
                {user.verifyImageUrl ? (
                  <a
                    href={user.verifyImageUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 underline"
                  >
                    View Document
                  </a>
                ) : (
                  'No Document'
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell colSpan={6}>Total Users</TableCell>
            <TableCell className="text-right">{users.length}</TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    </Layout>
  );
};
