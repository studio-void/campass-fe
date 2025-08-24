import { useState } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from '@tanstack/react-router';
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

type Team = {
  id: string;
  name: string;
  desc: string;
};

const TEAMS: Team[] = [
  { id: 'void', name: 'VO!D', desc: 'Junction contest' },
  { id: 'campass', name: 'Campass', desc: 'practice typescript' },
  { id: 'fliggle', name: 'Fliggle', desc: 'practice flutter' },
];

const Schema = z.object({
  project: z.string().min(1, 'Please enter project name.'),
  count: z.number().int().positive('Enter meeting count.'),
  duration: z.number().int().positive('Enter meeting duration (minutes).'),
});
type FormValues = z.infer<typeof Schema>;

export default function TeamProjectIndexPage() {
  const navigate = useNavigate({ from: '/team' });
  const [selected, setSelected] = useState<Team | null>(TEAMS[0]);

  const form = useForm<FormValues>({
    resolver: zodResolver(Schema),
    mode: 'onChange',
    defaultValues: {
      project: '',
      count: 1,
      duration: 60,
    },
  });

  const onSubmit = (values: FormValues) => {
    if (!selected) return toast.error('Please select a team.');
    navigate({
      to: '/team/calendar',
      search: {
        team: selected.id,
        project: values.project,
        count: values.count,
        duration: values.duration,
      },
    });
  };

  return (
    <Layout>
      <section className="py-10 md:py-14 w-full">
        <div className="mx-auto w-full">
          <h1 className="text-3xl font-semibold">Team Project</h1>
          <p className="mt-1 text-neutral-600">
            Please choose a team to work on the project with and let me know the
            answer to your project description
          </p>

          <h2 className="mt-8 mb-4 font-medium">Select the team</h2>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {TEAMS.map((t) => {
              const active = selected?.id === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setSelected(t)}
                  aria-pressed={active ? 'true' : 'false'}
                  className={[
                    'w-full rounded-2xl text-left outline-none transition-all focus-visible:ring-2 focus-visible:ring-blue-500',
                    active ? 'ring-2 ring-blue-500' : 'ring-0',
                  ].join(' ')}
                >
                  <Card className="rounded-2xl shadow-sm hover:shadow-md">
                    <CardContent className="p-6">
                      <div className="text-lg font-semibold">{t.name}</div>
                      <p className="mt-2 text-sm text-neutral-700">{t.desc}</p>
                    </CardContent>
                  </Card>
                </button>
              );
            })}
          </div>

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="mt-8 space-y-6"
            >
              <FormField
                control={form.control}
                name="project"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Project name</FormLabel>
                    <FormControl>
                      <Input
                        className="mt-2 h-11"
                        placeholder="Enter the name of Project."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="count"
                render={({ field: { value, onChange, ...field } }) => (
                  <FormItem>
                    <FormLabel>Team meeting number</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={1}
                        className="mt-2 h-11"
                        placeholder="How many times you need to meet?"
                        value={value || ''}
                        onChange={(e) => onChange(Number(e.target.value) || 1)}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="duration"
                render={({ field: { value, onChange, ...field } }) => (
                  <FormItem>
                    <FormLabel>Team meeting duration (minutes)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={10}
                        className="mt-2 h-11"
                        placeholder="How long will meeting take? (minutes)"
                        value={value || ''}
                        onChange={(e) => onChange(Number(e.target.value) || 60)}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end">
                <Button
                  type="submit"
                  className="h-11 px-10"
                  disabled={!form.formState.isValid}
                >
                  Next
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </section>
    </Layout>
  );
}
