import { useQuery } from '@tanstack/react-query';
import { createFileRoute, Link } from '@tanstack/react-router';
import { ArrowLeft } from 'lucide-react';
import { format } from 'date-fns';

import { couponsControllerFindByIdOptions } from '@/api/generated/@tanstack/react-query.gen';
import { useDocumentTitle } from '@/hooks/use-document-title';
import { PageHeader } from '@/components/shared/page-header';
import { StatusBadge } from '@/components/shared/status-badge';
import { COUPON_TYPE_MAP } from '@/components/shared/status-maps';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { CouponForm } from '@/features/coupons/components/coupon-form';

export const Route = createFileRoute('/_authenticated/coupons/$couponId')({
  component: CouponEditPage,
});

function CouponEditPage() {
  const { couponId } = Route.useParams();

  const { data, isLoading } = useQuery(
    couponsControllerFindByIdOptions({ path: { id: couponId } }),
  );

  const coupon = data?.data;
  useDocumentTitle(coupon ? `Coupon ${coupon.code}` : undefined);

  if (isLoading) {
    return (
      <div className='space-y-6'>
        <Skeleton className='h-10 w-48' />
        <Skeleton className='h-96 w-full' />
      </div>
    );
  }

  if (!coupon) {
    return <div>Coupon not found.</div>;
  }

  return (
    <div className='space-y-6'>
      <PageHeader
        title={coupon.code}
        description='Edit coupon details and rules'
      >
        <Button variant='outline' asChild>
          <Link to='/coupons'>
            <ArrowLeft size={16} />
            Back to coupons
          </Link>
        </Button>
      </PageHeader>

      <div className='grid grid-cols-1 gap-6 lg:grid-cols-3'>
        <div className='lg:col-span-2'>
          <CouponForm key={coupon.id} coupon={coupon} />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Coupon Info</CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div>
              <p className='text-muted-foreground text-sm'>Coupon ID</p>
              <p className='font-mono text-sm'>{coupon.id}</p>
            </div>
            <div>
              <p className='text-muted-foreground text-sm'>Type</p>
              <StatusBadge status={coupon.type} statusMap={COUPON_TYPE_MAP} />
            </div>
            <div>
              <p className='text-muted-foreground text-sm'>Status</p>
              {coupon.isActive ? (
                <Badge variant='default'>Active</Badge>
              ) : (
                <Badge variant='secondary'>Inactive</Badge>
              )}
            </div>
            <div>
              <p className='text-muted-foreground text-sm'>Usage Count</p>
              <p className='text-sm'>{coupon.usageCount}</p>
            </div>
            <div>
              <p className='text-muted-foreground text-sm'>Created</p>
              <p className='text-sm'>
                {format(new Date(coupon.createdAt), 'PPP p')}
              </p>
            </div>
            <div>
              <p className='text-muted-foreground text-sm'>Last updated</p>
              <p className='text-sm'>
                {format(new Date(coupon.updatedAt), 'PPP p')}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
