import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { Layout } from '@/components';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { postDormStorage } from '@/data/post-dorm-storage';
import { cn } from '@/lib/utils';

const STORAGE_OPTIONS = [
  'Building A basement (male, female)',
  'Building B 4th floor (male)',
  'Building B 5th floor (female)',
  'Building B 6th floor (female)',
];

const schema = z.object({
  room: z.string().min(1, 'Please enter your room number'),
  time: z.string().min(1, 'Please select a reservation time'),
  date: z.string().min(1, 'Please select a reservation date'),
  storage: z.string().min(1, 'Please select a storage option'),
  items: z.string().min(1, 'Please enter items to store'),
});

export default function StorageFormPage() {
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    mode: 'onChange',
    defaultValues: {
      room: '',
      time: '',
      date: '',
      storage: '',
      items: '',
    },
  });

  const onSubmit = async (data: z.infer<typeof schema>) => {
    try {
      // Convert date and time to ISO string format for the API
      const dateTime = `${data.date}T${data.time}:00.000Z`;

      await postDormStorage({
        storage: data.storage,
        items: data.items,
        storeAt: dateTime,
      });

      toast.success('Storage request submitted successfully!');
      form.reset();
    } catch (error) {
      // Error is already handled in the API function with toast
      console.error('Failed to submit storage request:', error);
      toast.error(`Failed to submit storage request: ${error}`);
    }
  };

  return (
    <Layout>
      <section className="mx-auto max-w-6xl px-4 py-10 md:py-14">
        <h1 className="text-[28px] md:text-[32px] font-extrabold tracking-tight">
          Dormitory : Application for storage use
        </h1>
        <p className="mt-3 text-neutral-600">
          All tasks must be applied at least before 8 p.m. the day before.{' '}
          <br />
          Please note that the work received after 8 p.m. can be processed the
          next day.
        </p>

        <div className="mx-auto w-full max-w-5xl">
          <Card className="mt-10 rounded-2xl">
            <CardContent className="p-7 md:p-10">
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className={cn(
                    'space-y-8',
                    form.formState.isSubmitting && 'opacity-50',
                  )}
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
                    <div className="space-y-7">
                      <FormField
                        control={form.control}
                        name="room"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-base">
                              Room number
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder="A000"
                                className="h-11 rounded-xl border-blue-300"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
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
                                  className="h-11 rounded-xl border-blue-300"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
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
                                  className="h-11 rounded-xl border-blue-300"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    <div className="space-y-7">
                      <FormField
                        control={form.control}
                        name="items"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-base">
                              Items to store
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Enter items description"
                                className="h-11 rounded-xl border-blue-300"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="storage"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-base">
                              Select the storage you want
                            </FormLabel>
                            <FormControl>
                              <RadioGroup
                                value={field.value}
                                onValueChange={field.onChange}
                                className="space-y-3 mt-3"
                              >
                                {STORAGE_OPTIONS.map((opt) => (
                                  <div
                                    key={opt}
                                    className="flex items-center space-x-3"
                                  >
                                    <RadioGroupItem value={opt} id={opt} />
                                    <label
                                      htmlFor={opt}
                                      className="text-base cursor-pointer"
                                    >
                                      {opt}
                                    </label>
                                  </div>
                                ))}
                              </RadioGroup>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <div className="mt-10 flex justify-center">
                    <Button
                      type="submit"
                      disabled={form.formState.isSubmitting}
                      className="h-12 md:h-14 px-12 md:px-16 min-w-[340px] text-base md:text-lg"
                    >
                      {form.formState.isSubmitting ? 'Submitting…' : 'Apply'}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </section>
    </Layout>
  );
}
