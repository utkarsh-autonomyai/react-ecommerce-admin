import { useQuery } from '@tanstack/react-query';
import { createFileRoute, Link } from '@tanstack/react-router';
import { ArrowLeft } from 'lucide-react';

import { ordersControllerGetOrderByIdOptions } from '@/api/generated/@tanstack/react-query.gen';
import { PageHeader } from '@/components/shared/page-header';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { OrderDetail } from '@/features/orders/components/order-detail';
import { StatusUpdateForm } from '@/features/orders/components/status-update-form';

export const Route = createFileRoute('/_authenticated/orders/$orderId')({
  component: OrderDetailPage,
});

function OrderDetailPage() {
  const { orderId } = Route.useParams();

  const { data, isLoading } = useQuery(
    ordersControllerGetOrderByIdOptions({ path: { id: orderId } }),
  );

  if (isLoading) {
    return (
      <div className='space-y-6'>
        <Skeleton className='h-10 w-48' />
        <Skeleton className='h-96 w-full' />
      </div>
    );
  }

  const order = data?.data;

  if (!order) {
    return <div>Order not found.</div>;
  }

  return (
    <div className='space-y-6'>
      <PageHeader
        title={`Order ${order.orderNumber}`}
        description={`Status: ${order.status}`}
      >
        <Button variant='outline' asChild>
          <Link to='/orders'>
            <ArrowLeft size={16} />
            Back to orders
          </Link>
        </Button>
      </PageHeader>

      <div className='grid grid-cols-1 gap-6 lg:grid-cols-3'>
        <div className='lg:col-span-2'>
          <OrderDetail order={order} />
        </div>

        <div>
          <StatusUpdateForm key={order.status} order={order} />
        </div>
      </div>
    </div>
  );
}
