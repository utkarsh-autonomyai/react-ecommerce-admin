import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import {
  paymentsControllerGetAllPaymentsQueryKey,
  paymentsControllerRefundMutation,
} from '@/api/generated/@tanstack/react-query.gen';
import type { PaymentWithOrderDto } from '@/api/generated/types.gen';
import { FormField } from '@/components/shared/form-field';
import { MoneyDisplay } from '@/components/shared/money-display';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

type RefundDialogProps = {
  payment: PaymentWithOrderDto;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export const RefundDialog = ({
  payment,
  open,
  onOpenChange,
}: RefundDialogProps) => {
  const queryClient = useQueryClient();
  const maxRefundable =
    parseFloat(payment.amount) - parseFloat(payment.refundedAmount);

  const refundSchema = z.object({
    amount: z
      .string()
      .optional()
      .refine(
        (val) => {
          if (!val) return true;
          const num = parseFloat(val);
          return !isNaN(num) && num > 0 && num <= maxRefundable;
        },
        {
          message: `Amount must be between 0.01 and ${maxRefundable.toFixed(2)}`,
        },
      ),
    reason: z.string().optional(),
  });

  type RefundFormValues = z.infer<typeof refundSchema>;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<RefundFormValues>({
    resolver: zodResolver(refundSchema),
    defaultValues: {
      amount: '',
      reason: '',
    },
  });

  const mutation = useMutation({
    ...paymentsControllerRefundMutation(),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: paymentsControllerGetAllPaymentsQueryKey(),
      });
      reset();
      onOpenChange(false);
    },
  });

  const handleFormSubmit = (values: RefundFormValues) => {
    mutation.mutate({
      path: { paymentId: payment.id },
      body: {
        amount: values.amount || undefined,
        reason: values.reason || undefined,
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Refund Payment</DialogTitle>
          <DialogDescription>
            Order {payment.order.orderNumber} —{' '}
            <MoneyDisplay amount={parseFloat(payment.amount)} /> paid
            {parseFloat(payment.refundedAmount) > 0 && (
              <>
                , <MoneyDisplay amount={parseFloat(payment.refundedAmount)} />{' '}
                already refunded
              </>
            )}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className='space-y-4'>
          <FormField
            name='amount'
            label='Refund Amount'
            description={`Leave empty for full refund (${maxRefundable.toFixed(2)} zl). Enter amount for partial refund.`}
            error={errors.amount?.message}
          >
            <Input
              {...register('amount')}
              type='number'
              step='0.01'
              min='0.01'
              max={maxRefundable}
              placeholder={maxRefundable.toFixed(2)}
            />
          </FormField>

          <FormField
            name='reason'
            label='Reason'
            error={errors.reason?.message}
          >
            <Textarea
              {...register('reason')}
              placeholder='Optional reason for refund...'
              rows={3}
            />
          </FormField>

          <DialogFooter>
            <Button
              type='button'
              variant='outline'
              onClick={() => onOpenChange(false)}
              disabled={mutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type='submit'
              variant='destructive'
              disabled={mutation.isPending}
            >
              {mutation.isPending ? 'Processing...' : 'Refund'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
