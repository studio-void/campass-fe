import { useState } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { Check, ChevronDown } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { Layout } from '@/components';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '@/components/ui/command';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Textarea } from '@/components/ui/textarea';
import { postDormCheck } from '@/data/post-dorm-check';
import { cn } from '@/lib/utils';

const CATEGORY_OPTIONS = [
  { value: 'retirement_all', label: 'Full Room Retirement Inspection' },
  { value: 'retirement_one', label: 'Single Person Retirement Inspection' },
  { value: 'maintenance', label: 'Maintenance Inspection' },
];

const schema = z.object({
  room: z.string().min(1, 'Please enter your room number'),
  category: z.string().min(1, 'Please select a category'),
  date: z.string().min(1, 'Please select a reservation date'),
  time: z.string().min(1, 'Please select a reservation time'),
  note: z.string().optional(),
});

function CategoryCombobox({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const selected = CATEGORY_OPTIONS.find((o) => o.value === value);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {selected ? (
            selected.label
          ) : (
            <span className="text-muted-foreground">{placeholder}</span>
          )}
          <ChevronDown className="ml-2 h-4 w-4 opacity-70" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0 w-[--radix-popover-trigger-width]">
        <Command>
          <CommandInput placeholder="Search category..." />
          <CommandEmpty>No category found.</CommandEmpty>
          <CommandGroup>
            {CATEGORY_OPTIONS.map((opt) => (
              <CommandItem
                key={opt.value}
                value={opt.label}
                onSelect={() => {
                  onChange(opt.value);
                  setOpen(false);
                }}
                className="text-sm"
              >
                <Check
                  className={`mr-2 h-4 w-4 ${value === opt.value ? 'opacity-100' : 'opacity-0'}`}
                />
                {opt.label}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

export default function CheckFormPage() {
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    mode: 'onChange',
    defaultValues: {
      room: '',
      category: '',
      date: '',
      time: '',
      note: '',
    },
  });

  const onSubmit = async (data: z.infer<typeof schema>) => {
    // category 값을 type으로 변환
    let type: 'MAINTENANCE' | 'SINGLE_EXIT' | 'DOUBLE_EXIT';
    switch (data.category) {
      case 'maintenance':
        type = 'MAINTENANCE';
        break;
      case 'retirement_one':
        type = 'SINGLE_EXIT';
        break;
      case 'retirement_all':
      default:
        type = 'DOUBLE_EXIT';
        break;
    }
    const checkAt = `${data.date}T${data.time}:00.000Z`;
    try {
      await postDormCheck({
        dorm: data.room,
        notes: data.note,
        type,
        checkAt,
      });
      toast.success('Application submitted successfully!');
      form.reset();
    } catch (error) {
      toast.error('Failed to submit application.');
    }
  };

  return (
    <Layout>
      <div className="space-y-6 mb-24 w-full">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Inspection Application Form</h1>
            <p className="text-muted-foreground">
              Fill out the form to submit your inspection request
            </p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_400px] items-start">
          {/* Application Form */}
          <Card>
            <CardHeader>
              <CardTitle>Application Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className={cn(
                    'space-y-6',
                    form.formState.isSubmitting && 'opacity-50',
                  )}
                >
                  <FormField
                    control={form.control}
                    name="room"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Room Number</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., A123" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Inspection Type</FormLabel>
                        <FormControl>
                          <CategoryCombobox
                            value={field.value}
                            onChange={field.onChange}
                            placeholder="Select inspection type..."
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid gap-4 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="date"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Reservation Date</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="time"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Reservation Time</FormLabel>
                          <FormControl>
                            <Input type="time" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="note"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Additional Notes (Optional)</FormLabel>
                        <FormControl>
                          <Textarea
                            rows={4}
                            placeholder="Any special requirements or notes for the inspection..."
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="pt-4">
                    <Button
                      type="submit"
                      disabled={form.formState.isSubmitting}
                      size="lg"
                      className="w-full"
                    >
                      {form.formState.isSubmitting
                        ? 'Submitting...'
                        : 'Submit Application'}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>

          {/* Guidelines Sidebar */}
          <Card className="border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle className="text-red-700">
                Important Guidelines
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-red-700">
              <div>
                <h4 className="font-medium mb-2">Application Rules:</h4>
                <ul className="space-y-1 list-disc list-inside">
                  <li>Submit applications before 8 PM the day before</li>
                  <li>Late applications will be processed the next day</li>
                  <li>Ensure you select the correct inspection type</li>
                </ul>
              </div>

              <div>
                <h4 className="font-medium mb-2">Inspection Types:</h4>
                <ul className="space-y-1 list-disc list-inside">
                  <li>
                    <strong>Full Room:</strong> All residents leaving
                  </li>
                  <li>
                    <strong>Single Person:</strong> One person leaving
                  </li>
                  <li>
                    <strong>Maintenance:</strong> Annual room check
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="font-medium mb-2">Important Notes:</h4>
                <ul className="space-y-1 list-disc list-inside">
                  <li>Final resident must choose full room checkout</li>
                  <li>Wrong application type may result in rejection</li>
                  <li>Applications outside official periods not accepted</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
