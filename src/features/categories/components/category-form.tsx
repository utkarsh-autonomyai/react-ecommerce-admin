import { useEffect, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';

import {
  categoriesControllerCreateMutation,
  categoriesControllerFindAllQueryKey,
  categoriesControllerFindAllAdminQueryKey,
  categoriesControllerFindAllAdminOptions,
  categoriesControllerFindBySlugQueryKey,
  categoriesControllerUpdateMutation,
  categoriesControllerUploadImageMutation,
} from '@/api/generated/@tanstack/react-query.gen';
import type { CategoryResponseDto } from '@/api/generated/types.gen';
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
import { generateSlug, slugSchema } from '@/lib/utils';
import { ADMIN_IS_ACTIVE_FILTER, ADMIN_DROPDOWN_LIMIT } from '@/lib/constants';
import { toast } from 'sonner';
import { z } from 'zod';

const categoryFormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  slug: slugSchema,
  description: z.string().max(1000, 'Description too long').optional(),
  parentId: z.string().optional(),
  sortOrder: z.number().int().min(0),
  isActive: z.boolean(),
});

type CategoryFormValues = z.infer<typeof categoryFormSchema>;

type CategoryFormProps = {
  category?: CategoryResponseDto;
};

export const CategoryForm = ({ category }: CategoryFormProps) => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const isEditing = Boolean(category);

  const { data: categoriesData } = useQuery({
    ...categoriesControllerFindAllAdminOptions({
      query: { limit: ADMIN_DROPDOWN_LIMIT, isActive: ADMIN_IS_ACTIVE_FILTER },
    }),
  });

  const parentOptions = (categoriesData?.data ?? []).filter(
    (c) => c.id !== category?.id,
  );

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    control,
    formState: { errors, isDirty },
  } = useForm<CategoryFormValues>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: {
      name: category?.name ?? '',
      slug: typeof category?.slug === 'string' ? category.slug : '',
      description:
        typeof category?.description === 'string' ? category.description : '',
      parentId:
        typeof category?.parentId === 'string' ? category.parentId : undefined,
      sortOrder: category?.sortOrder ?? 0,
      isActive: category?.isActive ?? true,
    },
  });

  const parentId = useWatch({ control, name: 'parentId' });
  const isActive = useWatch({ control, name: 'isActive' });
  const nameValue = useWatch({ control, name: 'name' });

  // Track whether the user has manually edited the slug
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);

  // Auto-generate slug from name when user hasn't manually edited it
  useEffect(() => {
    if (!slugManuallyEdited && nameValue) {
      setValue('slug', generateSlug(nameValue));
    }
  }, [nameValue, slugManuallyEdited, setValue]);

  const [imageFile, setImageFile] = useState<File | null>(null);
  const existingImageUrl =
    typeof category?.imageUrl === 'string' ? category.imageUrl : null;

  const invalidateCategories = () => {
    queryClient.invalidateQueries({
      queryKey: categoriesControllerFindAllQueryKey(),
    });
    queryClient.invalidateQueries({
      queryKey: categoriesControllerFindAllAdminQueryKey(),
    });
  };

  const createMutation = useMutation({
    ...categoriesControllerCreateMutation(),
    onSuccess: invalidateCategories,
  });

  const updateMutation = useMutation({
    ...categoriesControllerUpdateMutation(),
    onSuccess: invalidateCategories,
  });

  const uploadImageMutation = useMutation({
    ...categoriesControllerUploadImageMutation(),
    onSuccess: invalidateCategories,
  });

  const isPending =
    createMutation.isPending ||
    updateMutation.isPending ||
    uploadImageMutation.isPending;

  const onSubmit = async (values: CategoryFormValues) => {
    if (isEditing && category) {
      // PATCH: send null to clear nullable fields, undefined to leave unchanged
      const result = await updateMutation.mutateAsync({
        path: { id: category.id },
        body: {
          ...values,
          slug: values.slug || undefined,
          description: values.description || null,
          parentId: values.parentId || null,
        },
      });

      if (imageFile) {
        await uploadImageMutation.mutateAsync({
          path: { id: category.id },
          body: { file: imageFile },
        });
      }

      const updated = result.data;
      reset({
        name: updated.name,
        slug: updated.slug,
        description:
          typeof updated.description === 'string' ? updated.description : '',
        parentId:
          typeof updated.parentId === 'string' ? updated.parentId : undefined,
        sortOrder: updated.sortOrder,
        isActive: updated.isActive,
      });
      setImageFile(null);
      setSlugManuallyEdited(false);

      if (updated.slug !== category.slug) {
        queryClient.removeQueries({
          queryKey: categoriesControllerFindBySlugQueryKey({
            path: { slug: category.slug },
          }),
        });
      }

      toast.success('Category updated');
      navigate({ to: '/categories' });
    } else {
      // POST: omit empty optional fields
      const body = {
        ...values,
        slug: values.slug || undefined,
        description: values.description || undefined,
        parentId: values.parentId || undefined,
      };
      const result = await createMutation.mutateAsync({ body });

      if (imageFile) {
        await uploadImageMutation.mutateAsync({
          path: { id: result.data.id },
          body: { file: imageFile },
        });
      }

      toast.success('Category created');
      navigate({ to: '/categories' });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{isEditing ? 'Edit Category' : 'Create Category'}</CardTitle>
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
            <Textarea id='description' rows={3} {...register('description')} />
          </FormField>

          <FormField label='Parent Category' name='parentId'>
            <Select
              value={parentId ?? 'none'}
              onValueChange={(value) =>
                setValue('parentId', value === 'none' ? undefined : value, {
                  shouldDirty: true,
                })
              }
            >
              <SelectTrigger id='parentId'>
                <SelectValue placeholder='None (top-level)' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='none'>None (top-level)</SelectItem>
                {parentOptions.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>

          <FormField
            label='Sort Order'
            name='sortOrder'
            error={errors.sortOrder?.message}
            description='Lower numbers appear first'
          >
            <Input
              id='sortOrder'
              type='number'
              min={0}
              {...register('sortOrder', { valueAsNumber: true })}
            />
          </FormField>

          <FormField label='Active' name='isActive'>
            <Switch
              id='isActive'
              checked={isActive}
              onCheckedChange={(checked) =>
                setValue('isActive', checked, { shouldDirty: true })
              }
            />
          </FormField>

          <FormField label='Image' name='image'>
            <ImageUpload
              value={imageFile ?? existingImageUrl}
              onChange={(file) => setImageFile(file)}
            />
          </FormField>

          <Button
            type='submit'
            disabled={(!isDirty && !imageFile) || isPending}
          >
            {isPending
              ? 'Saving...'
              : isEditing
                ? 'Save changes'
                : 'Create category'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
