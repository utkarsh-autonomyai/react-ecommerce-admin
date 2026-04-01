import { useQuery } from '@tanstack/react-query';
import { createFileRoute, Link } from '@tanstack/react-router';
import { ArrowLeft } from 'lucide-react';
import { format } from 'date-fns';

import { shippingControllerFindByIdOptions } from '@/api/generated/@tanstack/react-query.gen';
import { useDocumentTitle } from '@/hooks/use-document-title';
import { PageHeader } from '@/components/shared/page-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ShippingForm } from '@/features/shipping/components/shipping-form';

export const Route = createFileRoute('/_authenticated/shipping/$shippingId')({
  component: ShippingEditPage,
});

function ShippingEditPage() {
  const { shippingId } = Route.useParams();

  const { data, isLoading } = useQuery(
    shippingControllerFindByIdOptions({ path: { id: shippingId } }),
  );

  const method = data?.data;
  useDocumentTitle(method?.name);

  if (isLoading) {
    return (
      <div className='space-y-6'>
        <Skeleton className='h-10 w-48' />
        <Skeleton className='h-96 w-full' />
      </div>
    );
  }

  if (!method) {
    return <div>Shipping method not found.</div>;
  }

  return (
    <div className='space-y-6'>
      <PageHeader
        title={method.name}
        description='Edit shipping method details'
      >
        <Button variant='outline' asChild>
          <Link to='/shipping'>
            <ArrowLeft size={16} />
            Back to shipping
          </Link>
        </Button>
      </PageHeader>

      <div className='grid grid-cols-1 gap-6 lg:grid-cols-3'>
        <div className='lg:col-span-2'>
          <ShippingForm key={method.id} method={method} />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Method Info</CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div>
              <p className='text-muted-foreground text-sm'>Method ID</p>
              <p className='font-mono text-sm'>{method.id}</p>
            </div>
            <div>
              <p className='text-muted-foreground text-sm'>Status</p>
              {method.isActive ? (
                <Badge variant='default'>Active</Badge>
              ) : (
                <Badge variant='secondary'>Inactive</Badge>
              )}
            </div>
            <div>
              <p className='text-muted-foreground text-sm'>Sort Order</p>
              <p className='text-sm'>{method.sortOrder}</p>
            </div>
            <div>
              <p className='text-muted-foreground text-sm'>Created</p>
              <p className='text-sm'>
                {format(new Date(method.createdAt), 'PPP p')}
              </p>
            </div>
            <div>
              <p className='text-muted-foreground text-sm'>Last updated</p>
              <p className='text-sm'>
                {format(new Date(method.updatedAt), 'PPP p')}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
