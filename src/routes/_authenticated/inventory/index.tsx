import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { z } from 'zod';

import { inventoryControllerGetLowStockProductsOptions } from '@/api/generated/@tanstack/react-query.gen';
import { useDocumentTitle } from '@/hooks/use-document-title';
import {
  DataTable,
  DataTablePagination,
  DataTableSkeleton,
} from '@/components/shared/data-table';
import { PageHeader } from '@/components/shared/page-header';
import { columns } from '@/features/inventory/components/inventory-columns';

const inventorySearchSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().default(10),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});

export const Route = createFileRoute('/_authenticated/inventory/')({
  validateSearch: inventorySearchSchema,
  component: InventoryPage,
});

function InventoryPage() {
  useDocumentTitle('Inventory');
  const search = Route.useSearch();
  const navigate = useNavigate();

  const { data, isLoading } = useQuery({
    ...inventoryControllerGetLowStockProductsOptions({
      query: {
        page: String(search.page),
        limit: String(search.limit),
        sortBy: search.sortBy,
        sortOrder: search.sortOrder,
      },
    }),
    placeholderData: keepPreviousData,
  });

  const handleStateChange = (state: {
    page: number;
    limit: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) => {
    navigate({
      to: '/inventory',
      search: state,
    });
  };

  return (
    <div className='space-y-6'>
      <PageHeader
        title='Inventory'
        description='Monitor low stock products and manage inventory levels'
      />

      {isLoading && !data ? (
        <DataTableSkeleton columnCount={8} rowCount={search.limit} />
      ) : (
        <DataTable
          columns={columns}
          data={data?.data ?? []}
          meta={data?.meta}
          state={search}
          onStateChange={handleStateChange}
        >
          <DataTablePagination />
        </DataTable>
      )}
    </div>
  );
}
