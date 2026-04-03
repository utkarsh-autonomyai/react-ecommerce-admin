import { useForm, useWatch } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { toast } from 'sonner';

import {
  usersControllerAdminUpdateUserMutation,
  usersControllerFindAllQueryKey,
  usersControllerFindByIdQueryKey,
} from '@/api/generated/@tanstack/react-query.gen';
import type { UserProfileDto } from '@/api/generated/types.gen';
import { useAuthStore } from '@/stores/auth.store';
import { FormField } from '@/components/shared/form-field';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const userFormSchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  role: z.enum(['CUSTOMER', 'ADMIN']),
  isActive: z.boolean(),
});

type UserFormValues = z.infer<typeof userFormSchema>;

type UserFormProps = {
  user: UserProfileDto;
};

export const UserForm = ({ user }: UserFormProps) => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const currentUser = useAuthStore((state) => state.user);
  const isSelf = currentUser?.id === user.id;

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    control,
    formState: { errors, isDirty },
  } = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      firstName: (user.firstName as unknown as string) ?? '',
      lastName: (user.lastName as unknown as string) ?? '',
      role: user.role,
      isActive: user.isActive,
    },
  });

  const updateMutation = useMutation({
    ...usersControllerAdminUpdateUserMutation(),
    onSuccess: (data) => {
      const updated = data.data;
      reset({
        firstName: (updated.firstName as unknown as string) ?? '',
        lastName: (updated.lastName as unknown as string) ?? '',
        role: updated.role,
        isActive: updated.isActive,
      });
      queryClient.invalidateQueries({
        queryKey: usersControllerFindByIdQueryKey({ path: { id: user.id } }),
      });
      queryClient.invalidateQueries({
        queryKey: usersControllerFindAllQueryKey(),
      });
      toast.success('User updated');
      navigate({ to: '/users' });
    },
  });

  const onSubmit = (values: UserFormValues) => {
    updateMutation.mutate({
      path: { id: user.id },
      body: values,
    });
  };

  const role = useWatch({ control, name: 'role' });
  const isActive = useWatch({ control, name: 'isActive' });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Edit User</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
          <FormField label='Email' name='email'>
            <Input id='email' value={user.email} disabled />
          </FormField>

          <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
            <FormField
              label='First Name'
              name='firstName'
              error={errors.firstName?.message}
            >
              <Input id='firstName' {...register('firstName')} />
            </FormField>

            <FormField
              label='Last Name'
              name='lastName'
              error={errors.lastName?.message}
            >
              <Input id='lastName' {...register('lastName')} />
            </FormField>
          </div>

          <FormField label='Role' name='role' error={errors.role?.message}>
            <Select
              value={role}
              onValueChange={(value: 'CUSTOMER' | 'ADMIN') =>
                setValue('role', value, { shouldDirty: true })
              }
              disabled={isSelf}
            >
              <SelectTrigger id='role'>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='ADMIN'>Admin</SelectItem>
                <SelectItem value='CUSTOMER'>Customer</SelectItem>
              </SelectContent>
            </Select>
          </FormField>

          <FormField label='Active' name='isActive'>
            <Switch
              id='isActive'
              checked={isActive}
              onCheckedChange={(checked) =>
                setValue('isActive', checked, { shouldDirty: true })
              }
              disabled={isSelf}
            />
          </FormField>

          <Button type='submit' disabled={!isDirty || updateMutation.isPending}>
            {updateMutation.isPending ? 'Saving...' : 'Save changes'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
