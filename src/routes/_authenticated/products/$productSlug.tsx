import { useQuery } from '@tanstack/react-query';
import { createFileRoute, Link } from '@tanstack/react-router';
import { ArrowLeft } from 'lucide-react';
import { format } from 'date-fns';

import { productsControllerFindBySlugOptions } from '@/api/generated/@tanstack/react-query.gen';
import { useDocumentTitle } from '@/hooks/use-document-title';
import { MoneyDisplay } from '@/components/shared/money-display';
import { PageHeader } from '@/components/shared/page-header';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ProductForm } from '@/features/products/components/product-form';

export const Route = createFileRoute('/_authenticated/products/$productSlug')({
  component: ProductDetailPage,
});

function ProductDetailPage() {
  const { productSlug } = Route.useParams();

  const { data, isLoading } = useQuery(
    productsControllerFindBySlugOptions({ path: { slug: productSlug } }),
  );

  const product = data?.data;
  useDocumentTitle(product?.name);

  if (isLoading) {
    return (
      <div className='space-y-6'>
        <Skeleton className='h-10 w-48' />
        <Skeleton className='h-96 w-full' />
      </div>
    );
  }

  if (!product) {
    return <div>Product not found.</div>;
  }

  return (
    <div className='space-y-6'>
      <PageHeader title={product.name} description={`Slug: ${product.slug}`}>
        <Button variant='outline' asChild>
          <Link to='/products'>
            <ArrowLeft size={16} />
            Back to products
          </Link>
        </Button>
      </PageHeader>

      <div className='grid grid-cols-1 gap-6 lg:grid-cols-3'>
        <div className='lg:col-span-2'>
          <ProductForm key={product.id} product={product} />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Product Info</CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div>
              <p className='text-muted-foreground text-sm'>Product ID</p>
              <p className='font-mono text-sm'>{product.id}</p>
            </div>
            <div>
              <p className='text-muted-foreground text-sm'>Category</p>
              <Badge variant='outline'>{product.category.name}</Badge>
            </div>
            <div>
              <p className='text-muted-foreground text-sm'>Price</p>
              <MoneyDisplay
                amount={parseFloat(product.price)}
                className='text-sm'
              />
            </div>
            <div>
              <p className='text-muted-foreground text-sm'>Stock</p>
              <p className='text-sm'>{product.stock}</p>
            </div>
            <div>
              <p className='text-muted-foreground text-sm'>Created</p>
              <p className='text-sm'>
                {format(new Date(product.createdAt), 'PPP p')}
              </p>
            </div>
            <div>
              <p className='text-muted-foreground text-sm'>Last updated</p>
              <p className='text-sm'>
                {format(new Date(product.updatedAt), 'PPP p')}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
