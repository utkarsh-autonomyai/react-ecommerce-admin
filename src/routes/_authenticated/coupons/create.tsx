import { createFileRoute, Link } from '@tanstack/react-router';
import { ArrowLeft } from 'lucide-react';

import { useDocumentTitle } from '@/hooks/use-document-title';
import { PageHeader } from '@/components/shared/page-header';
import { Button } from '@/components/ui/button';
import { CouponForm } from '@/features/coupons/components/coupon-form';

export const Route = createFileRoute('/_authenticated/coupons/create')({
  component: CouponCreatePage,
});

function CouponCreatePage() {
  useDocumentTitle('Create Coupon');
  return (
    <div className='space-y-6'>
      <PageHeader title='Create Coupon' description='Add a new discount coupon'>
        <Button variant='outline' asChild>
          <Link to='/coupons'>
            <ArrowLeft size={16} />
            Back to coupons
          </Link>
        </Button>
      </PageHeader>

      <div className='max-w-2xl'>
        <CouponForm />
      </div>
    </div>
  );
}
