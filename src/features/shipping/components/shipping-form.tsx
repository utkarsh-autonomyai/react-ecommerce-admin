import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { toast } from 'sonner';
import { z } from 'zod';

import {
  shippingControllerCreateMutation,
  shippingControllerUpdateMutation,
  shippingControllerFindAllQueryKey,
  shippingControllerFindByIdQueryKey,
} from '@/api/generated/@tanstack/react-query.gen';
import type { ShippingMethodDto } from '@/api/generated/types.gen';
import { FormField } from '@/components/shared/form-field';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { priceSchema } from '@/lib/utils';

const shippingFormSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be at most 100 characters'),
  description: z.string().max(500, 'Description too long').optional(),
  basePrice: priceSchema,
  freeShippingThreshold: z
    .string()
    .regex(/^\d+(\.\d{1,2})?$/, 'Must be a valid amount')
    .optional()
    .or(z.literal('')),
  estimatedDays: z
    .string()
    .min(1, 'Estimated days is required')
    .regex(/^\d+$/, 'Must be a whole number'),
  sortOrder: z.number().int().min(0, 'Must be 0 or greater'),
  isActive: z.boolean(),
});

type ShippingFormValues = z.infer<typeof shippingFormSchema>;

type ShippingFormProps = {
  method?: ShippingMethodDto;
};

export const ShippingForm = ({ method }: ShippingFormProps) => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const isEditing = Boolean(method);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    control,
    formState: { errors, isDirty },
  } = useForm<ShippingFormValues>({
    resolver: zodResolver(shippingFormSchema),
    defaultValues: {
      name: method?.name ?? '',
      description:
        typeof method?.description === 'string' ? method.description : '',
      basePrice: method?.basePrice ?? '',
      freeShippingThreshold:
        typeof method?.freeShippingThreshold === 'string'
          ? method.freeShippingThreshold
          : '',
      estimatedDays: method?.estimatedDays?.toString() ?? '',
      sortOrder: method?.sortOrder ?? 0,
      isActive: method?.isActive ?? true,
    },
  });

  const isActive = useWatch({ control, name: 'isActive' });

  const createMutation = useMutation({
    ...shippingControllerCreateMutation(),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: shippingControllerFindAllQueryKey(),
      });
    },
  });

  const updateMutation = useMutation({
    ...shippingControllerUpdateMutation(),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: shippingControllerFindAllQueryKey(),
      });
    },
  });

  const isPending = createMutation.isPending || updateMutation.isPending;

  const onSubmit = async (values: ShippingFormValues) => {
    if (isEditing && method) {
      const result = await updateMutation.mutateAsync({
        path: { id: method.id },
        body: {
          name: values.name,
          description: values.description || null,
          basePrice: values.basePrice,
          freeShippingThreshold: values.freeShippingThreshold || null,
          estimatedDays: values.estimatedDays,
          sortOrder: values.sortOrder,
          isActive: values.isActive,
        },
      });

      const updated = result.data;
      reset({
        name: updated.name,
        description:
          typeof updated.description === 'string' ? updated.description : '',
        basePrice: updated.basePrice,
        freeShippingThreshold:
          typeof updated.freeShippingThreshold === 'string'
            ? updated.freeShippingThreshold
            : '',
        estimatedDays: updated.estimatedDays.toString(),
        sortOrder: updated.sortOrder,
        isActive: updated.isActive,
      });

      queryClient.invalidateQueries({
        queryKey: shippingControllerFindByIdQueryKey({
          path: { id: method.id },
        }),
      });

      toast.success('Shipping method updated');
      navigate({ to: '/shipping' });
    } else {
      await createMutation.mutateAsync({
        body: {
          name: values.name,
          description: values.description || undefined,
          basePrice: values.basePrice,
          freeShippingThreshold: values.freeShippingThreshold || undefined,
          estimatedDays: values.estimatedDays,
          sortOrder: values.sortOrder,
          isActive: values.isActive,
        },
      });

      toast.success('Shipping method created');
      navigate({ to: '/shipping' });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {isEditing ? 'Edit Shipping Method' : 'Create Shipping Method'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
          <FormField
            label='Name'
            name='name'
            error={errors.name?.message}
            required
          >
            <Input
              id='name'
              placeholder='e.g. Standard Delivery'
              {...register('name')}
            />
          </FormField>

          <FormField
            label='Description'
            name='description'
            error={errors.description?.message}
          >
            <Textarea
              id='description'
              rows={3}
              placeholder='Brief description of this shipping method'
              {...register('description')}
            />
          </FormField>

          <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
            <FormField
              label='Base Price (PLN)'
              name='basePrice'
              error={errors.basePrice?.message}
              required
            >
              <Input
                id='basePrice'
                type='number'
                step='0.01'
                min='0'
                {...register('basePrice')}
              />
            </FormField>

            <FormField
              label='Free Shipping Threshold (PLN)'
              name='freeShippingThreshold'
              error={errors.freeShippingThreshold?.message}
              description='Order total above which shipping is free'
            >
              <Input
                id='freeShippingThreshold'
                type='number'
                step='0.01'
                min='0'
                {...register('freeShippingThreshold')}
              />
            </FormField>
          </div>

          <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
            <FormField
              label='Estimated Delivery Days'
              name='estimatedDays'
              error={errors.estimatedDays?.message}
              required
            >
              <Input
                id='estimatedDays'
                type='number'
                min='1'
                {...register('estimatedDays')}
              />
            </FormField>

            <FormField
              label='Sort Order'
              name='sortOrder'
              error={errors.sortOrder?.message}
              description='Lower values appear first'
            >
              <Input
                id='sortOrder'
                type='number'
                min='0'
                {...register('sortOrder', { valueAsNumber: true })}
              />
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
                : 'Create shipping method'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
