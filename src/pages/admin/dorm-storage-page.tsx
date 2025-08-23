import { useEffect, useState } from 'react';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Check, ChevronsUpDown, Package, Calendar, User, Phone, ClipboardList } from 'lucide-react';
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
import { getDormStorage } from '@/data/get-dorm-storage';
import {
  type PatchDormStorageRequest,
  patchDormStorage,
} from '@/data/patch-dorm-storage';
import { School } from '@/data/get-user';
import { cn } from '@/utils';

const StatusDropdown: React.FC<{
  statusOptions: { value: string; label: string; color: string }[];
  currentStatus: string;
  onStatusChange: (newStatus: string) => void;
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
      <PopoverContent className="p-0 w-40" align="start">
        <Command>
          <CommandList>
            <CommandGroup>
              {statusOptions.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.label}
                  onSelect={() => {
                    onStatusChange(option.value);
                    setOpen(false);
                  }}
                  className="cursor-pointer whitespace-nowrap"
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

export const DormStoragePage: React.FC = () => {
  const queryClient = useQueryClient();

  const statusOptions = [
    {
      value: 'NOT_STORED',
      label: 'Not Stored',
      color: 'bg-red-100 text-red-800',
    },
    { value: 'STORED', label: 'Stored', color: 'bg-green-100 text-green-800' },
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
    data: storageRequests = [],
    isLoading,
    error,
    isFetching,
  } = useQuery({
    queryKey: ['dormStorage'],
    queryFn: async () => {
      const dormData = await getDormStorage();
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
    storageId: number,
    newStatus: string,
    request: any,
  ) => {
    try {
      const isStored = newStatus === 'STORED';
      const updateData: PatchDormStorageRequest = {
        isStored,
        storage: request.storage,
        items: request.items,
        storeAt: request.storeAt?.toString(),
      };

      await patchDormStorage(updateData, storageId);
      toast.success(`Status updated to ${newStatus}`);
      // Refetch the data
      queryClient.invalidateQueries({ queryKey: ['dormStorage'] });
    } catch (error) {
      console.error('Failed to update storage status:', error);
      toast.error('Failed to update storage status', {
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
              Warehouse Storage Management
            </h1>
            <p className="text-lg text-gray-600">
              Review and manage student storage applications
            </p>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="border-0 shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 rounded-full">
                  <ClipboardList className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Requests</p>
                  <p className="text-2xl font-bold text-gray-900">{storageRequests.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-100 rounded-full">
                  <Package className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Stored</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {storageRequests.filter((req: any) => req.isStored).length}
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
                  <p className="text-sm font-medium text-gray-600">Awaiting Storage</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {storageRequests.filter((req: any) => !req.isStored).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Storage Requests Table */}
        <Card className="border-0 shadow-md">
          <CardContent className="p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">Storage Requests</h3>
            <Table className={cn(isFetching && 'opacity-50 transition-opacity')}>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">No.</TableHead>
                  <TableHead>Student Details</TableHead>
                  <TableHead>Storage Location</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Storage Date</TableHead>
                  <TableHead className="text-right">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {storageRequests.map((request, index) => (
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
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-md text-sm font-medium">
                        {request.storage}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-xs truncate" title={request.items}>
                        {request.items}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span>{formatDateTime(request.storeAt.toString())}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <StatusDropdown
                        statusOptions={statusOptions}
                        currentStatus={request.isStored ? 'STORED' : 'NOT_STORED'}
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
