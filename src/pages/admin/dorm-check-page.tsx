import { useEffect, useState } from 'react';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Check, ChevronsUpDown, ClipboardCheck, Calendar, User, Phone } from 'lucide-react';
import { toast } from 'sonner';

import { Layout, UserSchoolLogo } from '@/components';
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent } from '@/components/ui/card';
import { getDormCheck } from '@/data/get-dorm-check';
import {
  type PatchDormCheckRequest,
  patchDormCheck,
} from '@/data/patch-dorm-check';
import { School } from '@/data/get-user';
import { cn } from '@/utils';

const StatusDropdown: React.FC<{
  statusOptions: { value: string; label: string; color: string }[];
  currentStatus: string;
  onStatusChange: (newStatus: PatchDormCheckRequest['status']) => void;
}> = ({ statusOptions, currentStatus, onStatusChange }) => {
  const [open, setOpen] = useState(false);

  const currentOption = statusOptions.find(
    (option) => option.value === currentStatus,
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            'inline-flex items-center justify-between rounded-md px-2 py-1 text-xs font-medium cursor-pointer hover:opacity-80 transition-opacity',
            currentOption?.color || 'bg-gray-100 text-gray-800',
          )}
        >
          <span>{currentOption?.label || currentStatus}</span>
          <ChevronsUpDown className="ml-1 h-3 w-3 opacity-50" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="p-0 w-32" align="start">
        <Command>
          <CommandList>
            <CommandGroup>
              {statusOptions.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.label}
                  onSelect={() => {
                    onStatusChange(
                      option.value as PatchDormCheckRequest['status'],
                    );
                    setOpen(false);
                  }}
                  className="cursor-pointer"
                >
                  <Check
                    className={cn(
                      'mr-2 h-3 w-3',
                      currentStatus === option.value
                        ? 'opacity-100'
                        : 'opacity-0',
                    )}
                  />
                  <span
                    className={cn(
                      'px-2 py-0.5 rounded text-xs font-medium',
                      option.color,
                    )}
                  >
                    {option.label}
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export const DormCheckPage: React.FC = () => {
  const queryClient = useQueryClient();

  const statusOptions = [
    { value: 'PASS', label: 'Pass', color: 'bg-green-100 text-green-800' },
    { value: 'FAIL', label: 'Fail', color: 'bg-red-100 text-red-800' },
    { value: 'FIRST_CHECK', label: 'RE 1', color: 'bg-blue-100 text-blue-800' },
    {
      value: 'SECOND_CHECK',
      label: 'RE 2',
      color: 'bg-orange-100 text-orange-800',
    },
    {
      value: 'THIRD_CHECK',
      label: 'RE 3',
      color: 'bg-yellow-100 text-yellow-800',
    },
  ];

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    }).format(date);
  };

  const {
    data: inspectionRequests = [],
    isLoading,
    error,
    isFetching,
  } = useQuery({
    queryKey: ['dormCheck'],
    queryFn: async () => {
      const dormData = await getDormCheck();
      if (dormData) {
        return dormData;
      }
      throw new Error('No dorm data found');
    },
  });

  // Handle error with toast
  useEffect(() => {
    if (error) {
      console.error('Failed to fetch dorm data:', error);
      toast.error('Failed to load dorm data', {
        description: 'Please try refreshing the page',
      });
    }
  }, [error]);

  const handleStatusChange = async (
    checkId: number,
    newStatus: PatchDormCheckRequest['status'],
    check: any,
  ) => {
    try {
      const updateData: PatchDormCheckRequest = {
        status: newStatus,
        dorm: check.dorm,
        type: check.type,
        checkAt: check.checkAt?.toString(),
        notes: check.notes,
      };

      await patchDormCheck(updateData, checkId);
      toast.success(`Status updated to ${newStatus}`);
      // Refetch the data
      queryClient.invalidateQueries({ queryKey: ['dormCheck'] });
    } catch (error) {
      console.error('Failed to update status:', error);
      toast.error('Failed to update status', {
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
              Dormitory Inspection Management
            </h1>
            <p className="text-lg text-gray-600">
              Review and manage maintenance inspection applications
            </p>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="border-0 shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 rounded-full">
                  <ClipboardCheck className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Applications</p>
                  <p className="text-2xl font-bold text-gray-900">{inspectionRequests.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-100 rounded-full">
                  <Check className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Approved</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {inspectionRequests.filter((req: any) => req.status === 'PASS').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-amber-100 rounded-full">
                  <Calendar className="w-6 h-6 text-amber-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {inspectionRequests.filter((req: any) => req.status !== 'PASS' && req.status !== 'FAIL').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Applications Table */}
        <Card className="border-0 shadow-md">
          <CardContent className="p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">Inspection Applications</h3>
            <Table className={cn(isFetching && 'opacity-50 transition-opacity')}>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">No.</TableHead>
                  <TableHead>Student Details</TableHead>
                  <TableHead>Building</TableHead>
                  <TableHead>Inspection Type</TableHead>
                  <TableHead>Scheduled Date</TableHead>
                  <TableHead className="text-right">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {inspectionRequests.map((request, index) => (
                  <TableRow key={request.id}>
                    <TableCell className="font-medium">{index + 1}</TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-gray-400" />
                          <span className="font-medium">{request.user.name}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <span>ID: {request.user.number}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Phone className="w-3 h-3" />
                          <span>{request.user.tel}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-md text-sm font-medium">
                        {request.dorm}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-md text-sm font-medium">
                        {request.type}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span>{formatDateTime(request.checkAt.toString())}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <StatusDropdown
                        statusOptions={statusOptions}
                        currentStatus={request.status === 'PASS' ? 'DONE' : 'NOT_DONE'}
                        onStatusChange={(newStatus) =>
                          handleStatusChange(request.id, newStatus, request)
                        }
                      />
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
