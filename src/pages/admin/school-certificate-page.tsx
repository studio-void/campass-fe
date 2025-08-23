import { useEffect } from 'react';

import {
  DialogClose,
  DialogDescription,
  DialogTitle,
} from '@radix-ui/react-dialog';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Check, X, UserCheck, FileText, Clock, Users } from 'lucide-react';
import { toast } from 'sonner';

import { Button, Layout, UserSchoolLogo } from '@/components';
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
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent } from '@/components/ui/card';
import { getUserVerify } from '@/data/get-user-verify';
import { postUserVerifyApprove } from '@/data/post-user-verify-approve';
import { postUserVerifyReject } from '@/data/post-user-verify-reject';
import { School } from '@/data/get-user';

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
          <p>Loading...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Header Section with Logo and Title */}
      <div className="w-full max-w-7xl mx-auto px-4">
        {/* Logo and Title */}
        <div className="flex items-center gap-6 mb-8">
          <UserSchoolLogo school={School.GIST} className="w-20 h-20" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              School Certificate Verification
            </h1>
            <p className="text-lg text-gray-600">
              Review and verify student enrollment certificates
            </p>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="border-0 shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 rounded-full">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Applications</p>
                  <p className="text-2xl font-bold text-gray-900">{users.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-100 rounded-full">
                  <UserCheck className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Verified</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {users.filter((user: any) => user.verifyStatus === 'VERIFIED').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-amber-100 rounded-full">
                  <Clock className="w-6 h-6 text-amber-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {users.filter((user: any) => user.verifyStatus === 'PENDING').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-100 rounded-full">
                  <FileText className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">With Documents</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {users.filter((user: any) => user.verifyImageUrl).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Verification Requests Table */}
        <Card className="border-0 shadow-md">
          <CardContent className="p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">Verification Requests</h3>
            <Table className={isFetching ? 'opacity-50 transition-opacity' : ''}>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">No.</TableHead>
                  <TableHead>Student Details</TableHead>
                  <TableHead>School</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Documents</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user, index) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{index + 1}</TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="font-medium text-gray-900">{user.name}</div>
                        <div className="text-sm text-gray-600">ID: {user.number || 'N/A'}</div>
                        <div className="text-sm text-gray-600">{user.email}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-md text-sm font-medium">
                        {user.school}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
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
                          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                          <FileText className="w-4 h-4" />
                          View Document
                        </a>
                      ) : (
                        <span className="text-sm text-gray-500">No Document</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-end">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button size="sm" className="h-8 w-8 p-0">
                              <Check className="w-4 h-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle className="text-lg font-semibold">
                                Approve Student Verification
                              </DialogTitle>
                              <DialogDescription className="space-y-2">
                                <div className="text-base font-medium text-gray-900">
                                  {user.school} - {user.number} - {user.name}
                                </div>
                                {user.verifyImageUrl && (
                                  <a
                                    href={user.verifyImageUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm font-medium"
                                  >
                                    <FileText className="w-4 h-4" />
                                    View Submitted Document
                                  </a>
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
                            <Button size="sm" variant="destructive" className="h-8 w-8 p-0">
                              <X className="w-4 h-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle className="text-lg font-semibold">
                                Reject Student Verification
                              </DialogTitle>
                              <DialogDescription className="space-y-2">
                                <div className="text-base font-medium text-gray-900">
                                  {user.school} - {user.number} - {user.name}
                                </div>
                                {user.verifyImageUrl && (
                                  <a
                                    href={user.verifyImageUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm font-medium"
                                  >
                                    <FileText className="w-4 h-4" />
                                    View Submitted Document
                                  </a>
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
            </Table>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};
