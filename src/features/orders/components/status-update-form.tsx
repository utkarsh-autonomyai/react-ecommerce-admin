import { useMutation, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import {
  ordersControllerGetAllOrdersQueryKey,
  ordersControllerGetOrderByIdQueryKey,
  ordersControllerUpdateOrderStatusMutation,
} from '@/api/generated/@tanstack/react-query.gen';
import type { OrderDetailDto } from '@/api/generated/types.gen';
import { FormField } from '@/components/shared/form-field';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

// Valid status transitions — only show reachable next statuses
const STATUS_TRANSITIONS: Record<string, readonly string[]> = {
  PENDING: ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['PROCESSING', 'CANCELLED'],
  PROCESSING: ['SHIPPED', 'CANCELLED'],
  SHIPPED: ['DELIVERED'],
  DELIVERED: [],
  CANCELLED: [],
} as const;

const ALL_STATUSES = [
  'PENDING',
  'CONFIRMED',
  'PROCESSING',
  'SHIPPED',
  'DELIVERED',
  'CANCELLED',
] as const;

const statusUpdateSchema = z.object({
  status: z.enum(ALL_STATUSES),
  adminNotes: z
    .string()
    .max(1000, 'Admin notes must be 1000 characters or less')
    .optional(),
});

type StatusUpdateFormValues = z.infer<typeof statusUpdateSchema>;

type StatusUpdateFormProps = {
  order: OrderDetailDto;
};

export const StatusUpdateForm = ({ order }: StatusUpdateFormProps) => {
  const queryClient = useQueryClient();
  const validNextStatuses = STATUS_TRANSITIONS[order.status] ?? [];

  const {
    register,
    handleSubmit,
    setValue,
    control,
    reset,
    formState: { errors },
  } = useForm<StatusUpdateFormValues>({
    resolver: zodResolver(statusUpdateSchema),
    defaultValues: {
      status: validNextStatuses[0] as (typeof ALL_STATUSES)[number],
      adminNotes: '',
    },
  });

  const statusValue = useWatch({ control, name: 'status' });

  const mutation = useMutation({
    ...ordersControllerUpdateOrderStatusMutation(),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ordersControllerGetOrderByIdQueryKey({
          path: { id: order.id },
        }),
      });
      queryClient.invalidateQueries({
        queryKey: ordersControllerGetAllOrdersQueryKey(),
      });
      reset();
    },
  });

  const handleFormSubmit = (values: StatusUpdateFormValues) => {
    mutation.mutate({
      path: { id: order.id },
      body: {
        status: values.status,
        adminNotes: values.adminNotes || undefined,
      },
    });
  };

  // Terminal states — no further transitions possible
  if (validNextStatuses.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Update Status</CardTitle>
          <CardDescription>
            This order is {order.status.toLowerCase()} — no further status
            changes available.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Update Status</CardTitle>
        <CardDescription>
          Change the order status and optionally add admin notes.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(handleFormSubmit)} className='space-y-4'>
          <FormField
            name='status'
            label='New Status'
            error={errors.status?.message}
            required
          >
            <Select
              value={statusValue}
              onValueChange={(value) =>
                setValue('status', value as (typeof ALL_STATUSES)[number])
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {validNextStatuses.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status.charAt(0) + status.slice(1).toLowerCase()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>

          <FormField
            name='adminNotes'
            label='Admin Notes'
            description='Internal notes — not visible to customer'
            error={errors.adminNotes?.message}
          >
            <Textarea
              {...register('adminNotes')}
              placeholder='Optional notes about this status change...'
              rows={3}
              maxLength={1000}
            />
          </FormField>

          <Button type='submit' disabled={mutation.isPending}>
            {mutation.isPending ? 'Updating...' : 'Update Status'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
