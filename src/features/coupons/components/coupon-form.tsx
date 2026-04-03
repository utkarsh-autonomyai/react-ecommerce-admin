import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { toast } from 'sonner';
import { z } from 'zod';

import {
  couponsControllerCreateMutation,
  couponsControllerUpdateMutation,
  couponsControllerFindAllQueryKey,
  couponsControllerFindByIdQueryKey,
} from '@/api/generated/@tanstack/react-query.gen';
import type { CouponDto } from '@/api/generated/types.gen';
import { FormField } from '@/components/shared/form-field';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { priceSchema } from '@/lib/utils';

const COUPON_TYPES = ['PERCENTAGE', 'FIXED_AMOUNT'] as const;

const couponFormSchema = z.object({
  code: z
    .string()
    .min(3, 'Code must be at least 3 characters')
    .max(30, 'Code must be at most 30 characters')
    .regex(/^[A-Z0-9-]+$/i, 'Only letters, numbers, and hyphens allowed'),
  description: z.string().max(500, 'Description too long').optional(),
  type: z.enum(COUPON_TYPES),
  value: priceSchema,
  minimumOrderAmount: z
    .string()
    .regex(/^\d+(\.\d{1,2})?$/, 'Must be a valid amount')
    .optional()
    .or(z.literal('')),
  maximumDiscount: z
    .string()
    .regex(/^\d+(\.\d{1,2})?$/, 'Must be a valid amount')
    .optional()
    .or(z.literal('')),
  usageLimit: z.number().int().positive('Must be a positive number').optional(),
  usageLimitPerUser: z
    .number()
    .int()
    .positive('Must be a positive number')
    .optional(),
  validFrom: z.string().min(1, 'Start date is required'),
  validUntil: z.string().min(1, 'End date is required'),
  isActive: z.boolean(),
});

type CouponFormValues = z.infer<typeof couponFormSchema>;

type CouponFormProps = {
  coupon?: CouponDto;
};

const toDateInputValue = (isoDate: string): string => {
  return isoDate.slice(0, 10);
};

const toLocalDateString = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getDefaultDates = (): { validFrom: string; validUntil: string } => {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  return {
    validFrom: toLocalDateString(today),
    validUntil: toLocalDateString(tomorrow),
  };
};

export const CouponForm = ({ coupon }: CouponFormProps) => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const isEditing = Boolean(coupon);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    control,
    formState: { errors, isDirty },
  } = useForm<CouponFormValues>({
    resolver: zodResolver(couponFormSchema),
    defaultValues: {
      code: coupon?.code ?? '',
      description:
        typeof coupon?.description === 'string' ? coupon.description : '',
      type: coupon?.type ?? 'PERCENTAGE',
      value: coupon?.value ?? '',
      minimumOrderAmount:
        typeof coupon?.minimumOrderAmount === 'string'
          ? coupon.minimumOrderAmount
          : '',
      maximumDiscount:
        typeof coupon?.maximumDiscount === 'string'
          ? coupon.maximumDiscount
          : '',
      usageLimit:
        typeof coupon?.usageLimit === 'number' ? coupon.usageLimit : undefined,
      usageLimitPerUser:
        typeof coupon?.usageLimitPerUser === 'number'
          ? coupon.usageLimitPerUser
          : undefined,
      validFrom: coupon?.validFrom
        ? toDateInputValue(coupon.validFrom)
        : getDefaultDates().validFrom,
      validUntil: coupon?.validUntil
        ? toDateInputValue(coupon.validUntil)
        : getDefaultDates().validUntil,
      isActive: coupon?.isActive ?? true,
    },
  });

  const type = useWatch({ control, name: 'type' });
  const isActive = useWatch({ control, name: 'isActive' });

  const createMutation = useMutation({
    ...couponsControllerCreateMutation(),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: couponsControllerFindAllQueryKey(),
      });
    },
  });

  const updateMutation = useMutation({
    ...couponsControllerUpdateMutation(),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: couponsControllerFindAllQueryKey(),
      });
    },
  });

  const isPending = createMutation.isPending || updateMutation.isPending;

  const onSubmit = async (values: CouponFormValues) => {
    const code = values.code.toUpperCase();

    if (isEditing && coupon) {
      const result = await updateMutation.mutateAsync({
        path: { id: coupon.id },
        body: {
          code,
          description: values.description || null,
          type: values.type,
          value: values.value,
          minimumOrderAmount: values.minimumOrderAmount || null,
          maximumDiscount: values.maximumDiscount || null,
          usageLimit: values.usageLimit ?? null,
          usageLimitPerUser: values.usageLimitPerUser ?? null,
          validFrom: new Date(values.validFrom).toISOString(),
          validUntil: new Date(values.validUntil).toISOString(),
          isActive: values.isActive,
        },
      });

      const updated = result.data;
      reset({
        code: updated.code,
        description:
          typeof updated.description === 'string' ? updated.description : '',
        type: updated.type,
        value: updated.value,
        minimumOrderAmount:
          typeof updated.minimumOrderAmount === 'string'
            ? updated.minimumOrderAmount
            : '',
        maximumDiscount:
          typeof updated.maximumDiscount === 'string'
            ? updated.maximumDiscount
            : '',
        usageLimit:
          typeof updated.usageLimit === 'number'
            ? updated.usageLimit
            : undefined,
        usageLimitPerUser:
          typeof updated.usageLimitPerUser === 'number'
            ? updated.usageLimitPerUser
            : undefined,
        validFrom: toDateInputValue(updated.validFrom),
        validUntil: toDateInputValue(updated.validUntil),
        isActive: updated.isActive,
      });

      queryClient.invalidateQueries({
        queryKey: couponsControllerFindByIdQueryKey({
          path: { id: coupon.id },
        }),
      });

      toast.success('Coupon updated');
      navigate({ to: '/coupons' });
    } else {
      await createMutation.mutateAsync({
        body: {
          code,
          description: values.description || undefined,
          type: values.type,
          value: values.value,
          minimumOrderAmount: values.minimumOrderAmount || undefined,
          maximumDiscount: values.maximumDiscount || undefined,
          usageLimit: values.usageLimit,
          usageLimitPerUser: values.usageLimitPerUser,
          validFrom: new Date(values.validFrom).toISOString(),
          validUntil: new Date(values.validUntil).toISOString(),
          isActive: values.isActive,
        },
      });

      toast.success('Coupon created');
      navigate({ to: '/coupons' });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{isEditing ? 'Edit Coupon' : 'Create Coupon'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
          <FormField
            label='Code'
            name='code'
            error={errors.code?.message}
            required
            description='Will be converted to uppercase'
          >
            <Input id='code' {...register('code')} className='uppercase' />
          </FormField>

          <FormField
            label='Description'
            name='description'
            error={errors.description?.message}
          >
            <Textarea id='description' rows={3} {...register('description')} />
          </FormField>

          <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
            <FormField
              label='Discount Type'
              name='type'
              error={errors.type?.message}
              required
            >
              <Select
                value={type}
                onValueChange={(value) =>
                  setValue('type', value as CouponFormValues['type'], {
                    shouldDirty: true,
                  })
                }
              >
                <SelectTrigger id='type'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='PERCENTAGE'>Percentage (%)</SelectItem>
                  <SelectItem value='FIXED_AMOUNT'>
                    Fixed Amount (PLN)
                  </SelectItem>
                </SelectContent>
              </Select>
            </FormField>

            <FormField
              label={type === 'PERCENTAGE' ? 'Value (%)' : 'Value (PLN)'}
              name='value'
              error={errors.value?.message}
              required
            >
              <Input
                id='value'
                type='number'
                step='0.01'
                min='0'
                {...register('value')}
              />
            </FormField>
          </div>

          <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
            <FormField
              label='Minimum Order Amount (PLN)'
              name='minimumOrderAmount'
              error={errors.minimumOrderAmount?.message}
              description='Leave empty for no minimum'
            >
              <Input
                id='minimumOrderAmount'
                type='number'
                step='0.01'
                min='0'
                {...register('minimumOrderAmount')}
              />
            </FormField>

            <FormField
              label='Maximum Discount (PLN)'
              name='maximumDiscount'
              error={errors.maximumDiscount?.message}
              description='Cap for percentage coupons'
            >
              <Input
                id='maximumDiscount'
                type='number'
                step='0.01'
                min='0'
                {...register('maximumDiscount')}
              />
            </FormField>
          </div>

          <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
            <FormField
              label='Usage Limit'
              name='usageLimit'
              error={errors.usageLimit?.message}
              description='Total uses allowed (empty = unlimited)'
            >
              <Input
                id='usageLimit'
                type='number'
                min='1'
                {...register('usageLimit', {
                  setValueAs: (v: string) => {
                    const n = Number(v);
                    return v === '' || Number.isNaN(n) ? undefined : n;
                  },
                })}
              />
            </FormField>

            <FormField
              label='Limit Per User'
              name='usageLimitPerUser'
              error={errors.usageLimitPerUser?.message}
              description='Uses per customer (empty = unlimited)'
            >
              <Input
                id='usageLimitPerUser'
                type='number'
                min='1'
                {...register('usageLimitPerUser', {
                  setValueAs: (v: string) => {
                    const n = Number(v);
                    return v === '' || Number.isNaN(n) ? undefined : n;
                  },
                })}
              />
            </FormField>
          </div>

          <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
            <FormField
              label='Valid From'
              name='validFrom'
              error={errors.validFrom?.message}
              required
            >
              <Input id='validFrom' type='date' {...register('validFrom')} />
            </FormField>

            <FormField
              label='Valid Until'
              name='validUntil'
              error={errors.validUntil?.message}
              required
            >
              <Input id='validUntil' type='date' {...register('validUntil')} />
            </FormField>
          </div>

          <FormField label='Active' name='isActive'>
            <Switch
              id='isActive'
              checked={isActive}
              onCheckedChange={(checked) =>
                setValue('isActive', checked, { shouldDirty: true })
              }
            />
          </FormField>

          <Button type='submit' disabled={!isDirty || isPending}>
            {isPending
              ? 'Saving...'
              : isEditing
                ? 'Save changes'
                : 'Create coupon'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
