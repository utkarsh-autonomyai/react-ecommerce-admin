import { createFileRoute, Link } from '@tanstack/react-router';
import { ArrowLeft } from 'lucide-react';

import { useDocumentTitle } from '@/hooks/use-document-title';
import { PageHeader } from '@/components/shared/page-header';
import { Button } from '@/components/ui/button';
import { ShippingForm } from '@/features/shipping/components/shipping-form';

export const Route = createFileRoute('/_authenticated/shipping/create')({
  component: ShippingCreatePage,
});

function ShippingCreatePage() {
  useDocumentTitle('Add Shipping Method');
  return (
    <div className='space-y-6'>
      <PageHeader
        title='Add Shipping Method'
        description='Create a new shipping option'
      >
        <Button variant='outline' asChild>
          <Link to='/shipping'>
            <ArrowLeft size={16} />
            Back to shipping
          </Link>
        </Button>
      </PageHeader>

      <div className='max-w-2xl'>
        <ShippingForm />
      </div>
    </div>
  );
}
