import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { Layout } from '@/components';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
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
import { Textarea } from '@/components/ui/textarea';
import { postDormStorage } from '@/data/post-dorm-storage';
import { cn } from '@/lib/utils';

const STORAGE_OPTIONS = [
  {
    value: 'Building A basement (male, female)',
    label: 'Building A Basement',
    description: 'Available for all students',
  },
  {
    value: 'Building B 4th floor (male)',
    label: 'Building B 4th Floor',
    description: 'Male students only',
  },
  {
    value: 'Building B 5th floor (female)',
    label: 'Building B 5th Floor',
    description: 'Female students only',
  },
  {
    value: 'Building B 6th floor (female)',
    label: 'Building B 6th Floor',
    description: 'Female students only',
  },
];

const schema = z.object({
  room: z.string().min(1, 'Please enter your room number'),
  time: z.string().min(1, 'Please select a reservation time'),
  date: z.string().min(1, 'Please select a reservation date'),
  storage: z.string().min(1, 'Please select a storage option'),
  items: z.string().min(1, 'Please enter items to store'),
  notes: z.string().optional(),
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
      notes: '',
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

      toast.success('Storage application submitted successfully!');
      form.reset();
    } catch (error) {
      console.error('Failed to submit storage request:', error);
      toast.error(`Failed to submit storage request: ${error}`);
    }
  };

  return (
    <Layout>
      <div className="space-y-6 mb-24 w-full">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Storage Application Form</h1>
            <p className="text-muted-foreground">
              Submit your storage request for dormitory facilities
            </p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_400px] items-start">
          {/* Application Form */}
          <Card>
            <CardHeader>
              <CardTitle>Storage Request Details</CardTitle>
              <CardDescription>
                Fill out all required information for your storage application
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className={cn(
                    'space-y-6',
                    form.formState.isSubmitting && 'opacity-50',
                  )}
                >
                  <div className="grid gap-6 md:grid-cols-2">
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
                      name="items"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Items to Store</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="e.g., Clothes, Books, Electronics"
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
                    name="storage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Select Storage Location</FormLabel>
                        <FormControl>
                          <RadioGroup
                            value={field.value}
                            onValueChange={field.onChange}
                            className="space-y-3"
                          >
                            {STORAGE_OPTIONS.map((option) => (
                              <div
                                key={option.value}
                                className="flex items-start space-x-3 rounded-lg border p-4"
                              >
                                <RadioGroupItem
                                  value={option.value}
                                  id={option.value}
                                  className="mt-1"
                                />
                                <label
                                  htmlFor={option.value}
                                  className="flex-1 cursor-pointer"
                                >
                                  <div className="font-medium">
                                    {option.label}
                                  </div>
                                  <div className="text-sm text-muted-foreground">
                                    {option.description}
                                  </div>
                                </label>
                              </div>
                            ))}
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Additional Notes (Optional)</FormLabel>
                        <FormControl>
                          <Textarea
                            rows={3}
                            placeholder="Any special requirements or additional information..."
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
                        : 'Submit Storage Application'}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>

          {/* Guidelines Sidebar */}
          <div className="space-y-6">
            <Card className="border-blue-200 bg-blue-50">
              <CardHeader>
                <CardTitle className="text-blue-700">
                  Storage Guidelines
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-blue-700">
                <div>
                  <h4 className="font-medium mb-1">Application Timing:</h4>
                  <p>
                    Submit applications before 8 PM the day before your desired
                    date
                  </p>
                </div>
                <div>
                  <h4 className="font-medium mb-1">Storage Period:</h4>
                  <p>Items can be stored until 2 weeks before semester ends</p>
                </div>
                <div>
                  <h4 className="font-medium mb-1">Retrieval:</h4>
                  <p>Available during pre-announced storage opening hours</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-amber-200 bg-amber-50">
              <CardHeader>
                <CardTitle className="text-amber-700">
                  Important Notes
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-amber-700">
                <p>
                  • Refrigerator storage only available in old building storages
                </p>
                <p>
                  • Students leaving due to absence/graduation must collect all
                  items
                </p>
                <p>• Items left beyond the agreed period may be disposed of</p>
                <p>
                  • You are responsible for the security of your stored items
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}
