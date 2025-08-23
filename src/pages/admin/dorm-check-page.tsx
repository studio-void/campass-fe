import { useEffect, useState } from 'react';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Check, ChevronsUpDown } from 'lucide-react';
import { toast } from 'sonner';

import { Layout } from '@/components';
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
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { getDormCheck } from '@/data/get-dorm-check';
import {
  type PatchDormCheckRequest,
  patchDormCheck,
} from '@/data/patch-dorm-check';
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
    data: checks = [],
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
      <div className="text-2xl font-semibold mb-12 mt-4 text-start w-full">
        Dormitory: Application for Retirement / Maintenance Inspection
      </div>
      <Table className={cn(isFetching && 'opacity-50 transition-opacity')}>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">No.</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Student ID</TableHead>
            <TableHead>Tel</TableHead>
            <TableHead>Dorm</TableHead>
            <TableHead>Date</TableHead>
            <TableHead className="text-right">Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {checks.map((check, index) => (
            <TableRow key={check.id}>
              <TableCell className="font-medium">{index + 1}</TableCell>
              <TableCell>{check.user.name}</TableCell>
              <TableCell>{check.user.number}</TableCell>
              <TableCell>{check.user.tel}</TableCell>
              <TableCell>{check.dorm}</TableCell>
              <TableCell>{formatDateTime(check.checkAt.toString())}</TableCell>
              <TableCell className="text-right">
                <StatusDropdown
                  statusOptions={statusOptions}
                  currentStatus={check.status}
                  onStatusChange={(newStatus) =>
                    handleStatusChange(check.id, newStatus, check)
                  }
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell colSpan={6}>Total Checks</TableCell>
            <TableCell className="text-right">{checks.length}</TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    </Layout>
  );
};
