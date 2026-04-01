import { useQuery } from '@tanstack/react-query';
import { createFileRoute, Link } from '@tanstack/react-router';
import { Plus } from 'lucide-react';

import { shippingControllerFindAllOptions } from '@/api/generated/@tanstack/react-query.gen';
import { useDocumentTitle } from '@/hooks/use-document-title';
import { DataTable } from '@/components/shared/data-table';
import { PageHeader } from '@/components/shared/page-header';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { columns } from '@/features/shipping/components/shipping-columns';

export const Route = createFileRoute('/_authenticated/shipping/')({
  component: ShippingPage,
});

function ShippingPage() {
  useDocumentTitle('Shipping Methods');
  const { data, isLoading } = useQuery(shippingControllerFindAllOptions());

  const items = data?.data ?? [];

  return (
    <div className='space-y-6'>
      <PageHeader
        title='Shipping Methods'
        description='Manage shipping options available at checkout'
      >
        <Button asChild>
          <Link to='/shipping/create'>
            <Plus size={16} />
            Add Method
          </Link>
        </Button>
      </PageHeader>

      {isLoading ? (
        <div className='space-y-3'>
          {Array.from({ length: 4 }, (_, i) => (
            <Skeleton key={i} className='h-12 w-full' />
          ))}
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={items}
          meta={{
            total: items.length,
            page: 1,
            limit: items.length || 1,
            totalPages: 1,
            hasNextPage: false,
            hasPrevPage: false,
          }}
          state={{ page: 1, limit: items.length || 1 }}
          onStateChange={() => {}}
          emptyMessage='No shipping methods found.'
        />
      )}
    </div>
  );
}
