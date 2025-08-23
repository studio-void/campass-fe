import { useState } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from '@tanstack/react-router';
import { Check, ChevronsUpDown } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
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
import { postUser } from '@/data/post-user';
import { cn } from '@/lib/utils';

const schools = [
  { value: 'GIST', label: 'GIST' },
  { value: 'KAIST', label: 'KAIST' },
  { value: 'POSTECH', label: 'POSTECH' },
];

const schema = z.object({
  email: z.string().email('Must be a valid email'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters long')
    .max(32, 'Password must be at most 32 characters long'),
  name: z.string().min(1, 'Please enter your name'),
  tel: z
    .string()
    .min(1, 'Please enter your phone number')
    .regex(
      /^010-?\d{4}-?\d{4}$/,
      'Phone number must be in the format 010-1234-5678',
    ),
  nickname: z.string().min(1, 'Please enter your nickname'),
  school: z.string().min(1, 'Please select your school'),
  number: z
    .string()
    .min(1, 'Please enter your student ID')
    .regex(/^\d+$/, 'Student ID must be a number'),
});

export function SignUpForm() {
  const nav = useNavigate();
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    mode: 'onChange',
    defaultValues: {
      email: '',
      password: '',
      name: '',
      tel: '',
      nickname: '',
      school: '',
      number: '',
    },
  });

  const [openSchool, setOpenSchool] = useState(false);
  const selectedSchoolLabel = schools.find(
    (s) => s.value === form.getValues('school'),
  )?.label;

  const onSubmit = async (data: z.infer<typeof schema>) => {
    try {
      await postUser({
        email: data.email,
        password: data.password,
        name: data.name,
        tel: data.tel,
        nickname: data.nickname,
        school: data.school,
        number: data.number,
      });
      await nav({ to: '/auth/sign-in' });
    } catch {}
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className={cn('space-y-4', form.formState.isSubmitting && 'opacity-50')}
      >
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="Enter your email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  placeholder="Enter your password"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="tel"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone Number</FormLabel>
              <FormControl>
                <Input placeholder="Enter your phone number" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex gap-3">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter your legal name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="nickname"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel>Nickname</FormLabel>
                <FormControl>
                  <Input placeholder="Enter your nickname" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="school"
          render={({ field }) => (
            <FormItem>
              <FormLabel>School</FormLabel>
              <FormControl>
                <Popover open={openSchool} onOpenChange={setOpenSchool}>
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      className={cn(
                        'w-full h-10 inline-flex items-center justify-between rounded-md border px-3 text-sm',
                        'bg-background hover:bg-accent/40 transition-colors',
                      )}
                    >
                      <span
                        className={cn(
                          'truncate',
                          !field.value && 'text-muted-foreground',
                        )}
                      >
                        {selectedSchoolLabel ?? 'Please select your school'}
                      </span>
                      <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent
                    className="p-0 w-[var(--radix-popover-trigger-width)]"
                    align="start"
                  >
                    <Command>
                      <CommandInput placeholder="Search for your school" />
                      <CommandEmpty>No results found</CommandEmpty>
                      <CommandList>
                        <CommandGroup>
                          {schools.map((s) => (
                            <CommandItem
                              key={s.value}
                              value={s.label}
                              onSelect={() => {
                                form.setValue('school', s.value, {
                                  shouldValidate: true,
                                  shouldDirty: true,
                                });
                                setOpenSchool(false);
                              }}
                              className="cursor-pointer"
                            >
                              <Check
                                className={cn(
                                  'mr-2 h-4 w-4',
                                  field.value === s.value
                                    ? 'opacity-100'
                                    : 'opacity-0',
                                )}
                              />
                              {s.label}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="number"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Student ID</FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter your student ID"
                  inputMode="numeric"
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
            className="w-full h-12 text-base font-medium"
            disabled={form.formState.isSubmitting}
          >
            {form.formState.isSubmitting ? 'Processing...' : 'Submit'}
          </Button>
        </div>
        <div className="text-center pt-2">
          <span className="text-sm text-slate-600">
            Already have an account?{' '}
          </span>
          <Link
            to="/auth/sign-in"
            className="text-sm text-blue-600 font-semibold hover:text-blue-800 transition-colors"
          >
            Sign In
          </Link>
        </div>
      </form>
    </Form>
  );
}
