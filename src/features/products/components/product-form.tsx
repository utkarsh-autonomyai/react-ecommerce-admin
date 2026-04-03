import { useEffect, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { Trash2 } from 'lucide-react';

import {
  categoriesControllerFindAllAdminOptions,
  productsControllerCreateMutation,
  productsControllerFindAllQueryKey,
  productsControllerFindAllAdminQueryKey,
  productsControllerFindBySlugQueryKey,
  productsControllerUpdateMutation,
  productsControllerUploadImageMutation,
  productsControllerRemoveImageMutation,
} from '@/api/generated/@tanstack/react-query.gen';
import type { ProductDetailDto } from '@/api/generated/types.gen';
import { FormField } from '@/components/shared/form-field';
import { ImageUpload } from '@/components/shared/image-upload';
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
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { generateSlug, slugSchema, priceSchema } from '@/lib/utils';
import { ADMIN_IS_ACTIVE_FILTER, ADMIN_DROPDOWN_LIMIT } from '@/lib/constants';
import { toast } from 'sonner';
import { z } from 'zod';

const priceOptionalSchema = z
  .string()
  .regex(/^\d+(\.\d{1,2})?$/, 'Must be a valid amount (e.g. 10.99)')
  .optional()
  .or(z.literal(''));

const productFormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  slug: slugSchema,
  description: z.string().max(5000, 'Description too long').optional(),
  price: priceSchema,
  comparePrice: priceOptionalSchema,
  sku: z.string().optional(),
  stock: z.number().int().min(0),
  categoryId: z.string().min(1, 'Category is required'),
  isActive: z.boolean(),
  isFeatured: z.boolean(),
});

type ProductFormValues = z.infer<typeof productFormSchema>;

type ProductFormProps = {
  product?: ProductDetailDto;
};

export const ProductForm = ({ product }: ProductFormProps) => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const isEditing = Boolean(product);

  const { data: categoriesData } = useQuery({
    ...categoriesControllerFindAllAdminOptions({
      query: { limit: ADMIN_DROPDOWN_LIMIT, isActive: ADMIN_IS_ACTIVE_FILTER },
    }),
  });

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    control,
    formState: { errors, isDirty },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: product?.name ?? '',
      slug: product?.slug ?? '',
      description:
        typeof product?.description === 'string' ? product.description : '',
      price: product?.price ?? '',
      comparePrice:
        typeof product?.comparePrice === 'string' ? product.comparePrice : '',
      sku: typeof product?.sku === 'string' ? product.sku : '',
      stock: product?.stock ?? 0,
      categoryId: product?.categoryId ?? '',
      isActive: product?.isActive ?? true,
      isFeatured: product?.isFeatured ?? false,
    },
  });

  const categoryId = useWatch({ control, name: 'categoryId' });
  const isActive = useWatch({ control, name: 'isActive' });
  const isFeatured = useWatch({ control, name: 'isFeatured' });
  const nameValue = useWatch({ control, name: 'name' });

  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);

  useEffect(() => {
    if (!slugManuallyEdited && nameValue) {
      setValue('slug', generateSlug(nameValue));
    }
  }, [nameValue, slugManuallyEdited, setValue]);

  const [newImageFile, setNewImageFile] = useState<File | null>(null);

  const invalidateProducts = () => {
    queryClient.invalidateQueries({
      queryKey: productsControllerFindAllQueryKey(),
    });
    queryClient.invalidateQueries({
      queryKey: productsControllerFindAllAdminQueryKey(),
    });
  };

  const createMutation = useMutation({
    ...productsControllerCreateMutation(),
    onSuccess: invalidateProducts,
  });

  const updateMutation = useMutation({
    ...productsControllerUpdateMutation(),
    onSuccess: invalidateProducts,
  });

  const uploadImageMutation = useMutation({
    ...productsControllerUploadImageMutation(),
    onSuccess: invalidateProducts,
  });

  const removeImageMutation = useMutation({
    ...productsControllerRemoveImageMutation(),
    onSuccess: () => {
      invalidateProducts();
      if (product) {
        queryClient.invalidateQueries({
          queryKey: productsControllerFindBySlugQueryKey({
            path: { slug: product.slug },
          }),
        });
      }
      toast.success('Image removed');
    },
  });

  const isPending =
    createMutation.isPending ||
    updateMutation.isPending ||
    uploadImageMutation.isPending;

  const onSubmit = async (values: ProductFormValues) => {
    const slugChanged = values.slug !== (product?.slug ?? '');

    if (isEditing && product) {
      // PATCH: send null to clear nullable fields, undefined to leave unchanged
      const result = await updateMutation.mutateAsync({
        path: { id: product.id },
        body: {
          ...values,
          slug: slugChanged ? values.slug || undefined : undefined,
          description: values.description || null,
          comparePrice: values.comparePrice || null,
          sku: values.sku || null,
        },
      });

      if (newImageFile) {
        await uploadImageMutation.mutateAsync({
          path: { id: product.id },
          body: { file: newImageFile },
        });
      }

      const updated = result.data;
      reset({
        name: updated.name,
        slug: updated.slug,
        description:
          typeof updated.description === 'string' ? updated.description : '',
        price: updated.price,
        comparePrice:
          typeof updated.comparePrice === 'string' ? updated.comparePrice : '',
        sku: typeof updated.sku === 'string' ? updated.sku : '',
        stock: updated.stock,
        categoryId: updated.categoryId,
        isActive: updated.isActive,
        isFeatured: updated.isFeatured,
      });
      setNewImageFile(null);
      setSlugManuallyEdited(false);

      if (updated.slug !== product.slug) {
        queryClient.removeQueries({
          queryKey: productsControllerFindBySlugQueryKey({
            path: { slug: product.slug },
          }),
        });
      }

      toast.success('Product updated');
      navigate({ to: '/products' });
    } else {
      // POST: omit empty optional fields
      const body = {
        ...values,
        slug: values.slug || undefined,
        description: values.description || undefined,
        comparePrice: values.comparePrice || undefined,
        sku: values.sku || undefined,
      };
      const result = await createMutation.mutateAsync({ body });

      if (newImageFile) {
        await uploadImageMutation.mutateAsync({
          path: { id: result.data.id },
          body: { file: newImageFile },
        });
      }

      toast.success('Product created');
      navigate({ to: '/products' });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{isEditing ? 'Edit Product' : 'Create Product'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
          <FormField
            label='Name'
            name='name'
            error={errors.name?.message}
            required
          >
            <Input id='name' {...register('name')} />
          </FormField>

          <FormField
            label='Slug'
            name='slug'
            error={errors.slug?.message}
            description={
              isEditing
                ? 'Auto-updates when you change the name'
                : 'Leave empty to auto-generate from name'
            }
          >
            <Input
              id='slug'
              {...register('slug', {
                onChange: () => setSlugManuallyEdited(true),
              })}
            />
          </FormField>

          <FormField
            label='Description'
            name='description'
            error={errors.description?.message}
          >
            <Textarea id='description' rows={4} {...register('description')} />
          </FormField>

          <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
            <FormField
              label='Price (PLN)'
              name='price'
              error={errors.price?.message}
              required
            >
              <Input
                id='price'
                type='number'
                step='0.01'
                min='0'
                {...register('price')}
              />
            </FormField>

            <FormField
              label='Compare Price (PLN)'
              name='comparePrice'
              error={errors.comparePrice?.message}
              description='Original price before discount'
            >
              <Input
                id='comparePrice'
                type='number'
                step='0.01'
                min='0'
                {...register('comparePrice')}
              />
            </FormField>
          </div>

          <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
            <FormField label='SKU' name='sku' error={errors.sku?.message}>
              <Input id='sku' {...register('sku')} />
            </FormField>

            <FormField label='Stock' name='stock' error={errors.stock?.message}>
              <Input
                id='stock'
                type='number'
                min={0}
                {...register('stock', { valueAsNumber: true })}
              />
            </FormField>
          </div>

          <FormField
            label='Category'
            name='categoryId'
            error={errors.categoryId?.message}
            required
          >
            <Select
              value={categoryId}
              onValueChange={(value) =>
                setValue('categoryId', value, { shouldDirty: true })
              }
            >
              <SelectTrigger id='categoryId'>
                <SelectValue placeholder='Select a category' />
              </SelectTrigger>
              <SelectContent>
                {(categoriesData?.data ?? []).map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>

          <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
            <FormField label='Active' name='isActive'>
              <Switch
                id='isActive'
                checked={isActive}
                onCheckedChange={(checked) =>
                  setValue('isActive', checked, { shouldDirty: true })
                }
              />
            </FormField>

            <FormField label='Featured' name='isFeatured'>
              <Switch
                id='isFeatured'
                checked={isFeatured}
                onCheckedChange={(checked) =>
                  setValue('isFeatured', checked, { shouldDirty: true })
                }
              />
            </FormField>
          </div>

          {product && product.images.length > 0 && (
            <FormField label='Current Images' name='currentImages'>
              <div className='flex flex-wrap gap-4'>
                {product.images.map((image) => (
                  <div key={image.id} className='relative'>
                    <img
                      src={image.url}
                      alt={
                        typeof image.alt === 'string' ? image.alt : product.name
                      }
                      className='h-20 w-20 rounded-md border object-cover sm:h-24 sm:w-24'
                    />
                    <Button
                      type='button'
                      variant='destructive'
                      size='icon'
                      className='absolute -top-2 -right-2 size-6'
                      disabled={removeImageMutation.isPending}
                      onClick={() =>
                        removeImageMutation.mutate({
                          path: { id: product.id, imageId: image.id },
                        })
                      }
                    >
                      <Trash2 className='size-3' />
                    </Button>
                  </div>
                ))}
              </div>
            </FormField>
          )}

          <FormField label='Add Image' name='newImage'>
            <ImageUpload
              value={newImageFile}
              onChange={(file) => setNewImageFile(file)}
            />
          </FormField>

          <Button
            type='submit'
            disabled={(!isDirty && !newImageFile) || isPending}
          >
            {isPending
              ? 'Saving...'
              : isEditing
                ? 'Save changes'
                : 'Create product'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
