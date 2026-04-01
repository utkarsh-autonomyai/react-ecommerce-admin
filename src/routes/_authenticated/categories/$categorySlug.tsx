import { useQuery } from '@tanstack/react-query';
import { createFileRoute, Link } from '@tanstack/react-router';
import { ArrowLeft } from 'lucide-react';
import { format } from 'date-fns';

import { categoriesControllerFindBySlugOptions } from '@/api/generated/@tanstack/react-query.gen';
import { useDocumentTitle } from '@/hooks/use-document-title';
import { PageHeader } from '@/components/shared/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { CategoryForm } from '@/features/categories/components/category-form';

export const Route = createFileRoute(
  '/_authenticated/categories/$categorySlug',
)({
  component: CategoryDetailPage,
});

function CategoryDetailPage() {
  const { categorySlug } = Route.useParams();

  const { data, isLoading } = useQuery(
    categoriesControllerFindBySlugOptions({ path: { slug: categorySlug } }),
  );

  const category = data?.data;
  useDocumentTitle(category?.name);

  if (isLoading) {
    return (
      <div className='space-y-6'>
        <Skeleton className='h-10 w-48' />
        <Skeleton className='h-96 w-full' />
      </div>
    );
  }

  if (!category) {
    return <div>Category not found.</div>;
  }

  return (
    <div className='space-y-6'>
      <PageHeader title={category.name} description={`Slug: ${category.slug}`}>
        <Button variant='outline' asChild>
          <Link to='/categories'>
            <ArrowLeft size={16} />
            Back to categories
          </Link>
        </Button>
      </PageHeader>

      <div className='grid grid-cols-1 gap-6 lg:grid-cols-3'>
        <div className='lg:col-span-2'>
          <CategoryForm key={category.id} category={category} />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Category Info</CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div>
              <p className='text-muted-foreground text-sm'>Category ID</p>
              <p className='font-mono text-sm'>{category.id}</p>
            </div>
            <div>
              <p className='text-muted-foreground text-sm'>Sort Order</p>
              <p className='text-sm'>{category.sortOrder}</p>
            </div>
            <div>
              <p className='text-muted-foreground text-sm'>Created</p>
              <p className='text-sm'>
                {format(new Date(category.createdAt), 'PPP p')}
              </p>
            </div>
            <div>
              <p className='text-muted-foreground text-sm'>Last updated</p>
              <p className='text-sm'>
                {format(new Date(category.updatedAt), 'PPP p')}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
