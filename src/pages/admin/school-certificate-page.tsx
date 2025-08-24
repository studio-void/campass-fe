import { useEffect } from 'react';

import {
  DialogClose,
  DialogDescription,
  DialogTitle,
} from '@radix-ui/react-dialog';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Check, Loader2, X } from 'lucide-react';
import { toast } from 'sonner';

import { Button, Layout } from '@/components';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { getUserVerify } from '@/data/get-user-verify';
import { postUserVerifyApprove } from '@/data/post-user-verify-approve';
import { postUserVerifyReject } from '@/data/post-user-verify-reject';

export const SchoolCertificatePage: React.FC = () => {
  const queryClient = useQueryClient();

  const {
    data: users = [],
    isLoading,
    error,
    isFetching,
  } = useQuery({
    queryKey: ['userVerify'],
    queryFn: async () => {
      const userData = await getUserVerify();
      if (userData) {
        return userData;
      }
      throw new Error('No user data found');
    },
  });

  console.log('Fetched users for verification:', users);

  // Handle error with toast
  useEffect(() => {
    if (error) {
      console.error('Failed to fetch user verify data:', error);
      toast.error('Failed to load user verification data', {
        description: 'Please try refreshing the page',
      });
    }
  }, [error]);

  const handleApprove = async (userId: number) => {
    try {
      await postUserVerifyApprove(userId);
      toast.success('User approved successfully');
      // Refetch the data
      queryClient.invalidateQueries({ queryKey: ['userVerify'] });
    } catch (error) {
      console.error('Failed to approve user:', error);
      toast.error('Failed to approve user', {
        description: 'Please try again',
      });
    }
  };

  const handleReject = async (userId: number) => {
    try {
      await postUserVerifyReject(userId);
      toast.success('User rejected successfully');
      // Refetch the data
      queryClient.invalidateQueries({ queryKey: ['userVerify'] });
    } catch (error) {
      console.error('Failed to reject user:', error);
      toast.error('Failed to reject user', {
        description: 'Please try again',
      });
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-32">
          <Loader2 size={16} className="animate-spin text-blue-600" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="text-2xl font-semibold mb-12 mt-4 text-start w-full">
        School Certification Manager Page
      </div>
      <Table className={isFetching ? 'opacity-50 transition-opacity' : ''}>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">No.</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Student ID</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>School</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Documents</TableHead>
            <TableHead className="text-right">Approval</TableHead>
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
              <TableCell>
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
              <TableCell className="text-right">
                <div className="flex gap-1 justify-end">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button size="icon">
                        <Check />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle className="text-lg font-semibold">
                          Do you want to approve this student?
                        </DialogTitle>
                        <DialogDescription>
                          {user.school} {user.number} {user.name} <br />
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
                        </DialogDescription>
                      </DialogHeader>
                      <DialogFooter>
                        <DialogClose asChild>
                          <Button variant="outline">Cancel</Button>
                        </DialogClose>
                        <DialogClose>
                          <Button onClick={() => handleApprove(user.id)}>
                            Approve
                          </Button>
                        </DialogClose>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button size="icon" variant="destructive">
                        <X />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle className="text-lg font-semibold">
                          Do you want to reject this student?
                        </DialogTitle>
                        <DialogDescription>
                          {user.school} {user.number} {user.name} <br />
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
                        </DialogDescription>
                      </DialogHeader>
                      <DialogFooter>
                        <DialogClose asChild>
                          <Button variant="outline">Cancel</Button>
                        </DialogClose>
                        <DialogClose>
                          <Button
                            variant="destructive"
                            onClick={() => handleReject(user.id)}
                          >
                            Reject
                          </Button>
                        </DialogClose>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell colSpan={7}>Total Users</TableCell>
            <TableCell className="text-right">{users.length}</TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    </Layout>
  );
};
