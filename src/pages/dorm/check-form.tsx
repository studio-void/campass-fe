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
  { value: 'retirement_all', label: 'Retirement Inspection (all residents)' },
  { value: 'retirement_one', label: 'A one person Retirement Inspection' },
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
          className="mt-2 h-11 w-full justify-between text-base"
        >
          {selected ? (
            selected.label
          ) : (
            <span className="text-neutral-400">{placeholder}</span>
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
      toast.success('Reservation submitted!');
      form.reset();
    } catch (error) {
      toast.error('Submission failed.');
    }
  };

  return (
    <Layout>
      <section className="mx-auto max-w-6xl px-4 py-10 md:py-14">
        <h1 className="text-[28px] md:text-[32px] font-extrabold tracking-tight">
          Dormitory : Application for Retirement / Maintenance Inspection
        </h1>
        <p className="mt-2 text-[15px] md:text-base text-neutral-600">
          All tasks must be applied at least before 8 p.m. the day before.
          Please note that the work received after 8 p.m. can be processed the
          next day.
        </p>

        <div className="mt-8 grid gap-10 md:gap-12 md:grid-cols-[minmax(0,720px)_360px] items-start">
          <Card className="rounded-2xl">
            <CardContent className="p-6 md:p-8 space-y-6">
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
                        <FormLabel className="text-base">Room number</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="A000"
                            className="mt-2 h-11 text-base"
                            {...field}
                          />
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
                        <FormLabel className="text-base">Category</FormLabel>
                        <FormControl>
                          <CategoryCombobox
                            value={field.value}
                            onChange={field.onChange}
                            placeholder="Choose the category..."
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="date"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-base">
                            Reservation date
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="date"
                              className="mt-2 h-11 text-base"
                              {...field}
                            />
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
                          <FormLabel className="text-base">
                            Reservation time
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="time"
                              className="mt-2 h-11 text-base"
                              {...field}
                            />
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
                        <FormLabel className="text-base">
                          Notes (optional)
                        </FormLabel>
                        <FormControl>
                          <Textarea
                            rows={4}
                            placeholder="Anything we should know before inspection…"
                            className="mt-2 text-base"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="pt-2 flex justify-end">
                    <Button
                      type="submit"
                      disabled={form.formState.isSubmitting}
                      className="h-12 md:h-13 px-10 md:px-12 text-base md:text-lg"
                    >
                      {form.formState.isSubmitting ? 'Submitting…' : 'Apply'}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>

          <Card className="rounded-2xl md:mt-8">
            <CardHeader className="pb-3">
              <CardTitle className="text-red-600">
                Checkout Inspection Guidelines
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="list-decimal ml-5 space-y-2 text-[15px] md:text-base text-neutral-900">
                <li>
                  The last resident to leave must submit a full-room checkout.
                </li>
                <li>
                  The final person leaving cannot apply as a single-person
                  checkout; a full-room checkout is required.
                </li>
                <li>You are responsible for any incorrect application.</li>
                <li>
                  If you choose the wrong checkout type, your application may be
                  rejected even if the inspection is completed.
                </li>
                <li>
                  Applications outside the official checkout period are not
                  accepted.
                </li>
              </ol>
              <p className="mt-4 text-[15px] md:text-base text-neutral-900">
                * Exceptions may be allowed only with prior approval from the
                supervising professor or dormitory office.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>
    </Layout>
  );
}
