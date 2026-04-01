import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { z } from 'zod';

import { ordersControllerGetAllOrdersOptions } from '@/api/generated/@tanstack/react-query.gen';
import { useDocumentTitle } from '@/hooks/use-document-title';
import {
  DataTable,
  DataTablePagination,
  DataTableSkeleton,
} from '@/components/shared/data-table';
import { PageHeader } from '@/components/shared/page-header';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ORDER_STATUS_MAP } from '@/components/shared/status-maps';
import { columns } from '@/features/orders/components/orders-columns';

const ORDER_STATUSES = [
  'PENDING',
  'CONFIRMED',
  'PROCESSING',
  'SHIPPED',
  'DELIVERED',
  'CANCELLED',
] as const;

const ordersSearchSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().default(10),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
  status: z.enum(ORDER_STATUSES).optional(),
});

export const Route = createFileRoute('/_authenticated/orders/')({
  validateSearch: ordersSearchSchema,
  component: OrdersPage,
});

function OrdersPage() {
  useDocumentTitle('Orders');
  const search = Route.useSearch();
  const navigate = useNavigate();

  const { data, isLoading } = useQuery({
    ...ordersControllerGetAllOrdersOptions({
      query: {
        page: String(search.page),
        limit: String(search.limit),
        sortBy: search.sortBy,
        sortOrder: search.sortOrder,
        status: search.status,
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
      to: '/orders',
      search: {
        ...state,
        status: search.status,
      },
    });
  };

  const handleStatusChange = (value: string) => {
    navigate({
      to: '/orders',
      search: {
        ...search,
        status:
          value === 'all'
            ? undefined
            : (value as (typeof ORDER_STATUSES)[number]),
        page: 1,
      },
    });
  };

  return (
    <div className='space-y-6'>
      <PageHeader title='Orders' description='Manage customer orders' />

      <div className='flex items-center gap-4'>
        <Select
          value={search.status ?? 'all'}
          onValueChange={handleStatusChange}
        >
          <SelectTrigger className='w-48'>
            <SelectValue placeholder='All statuses' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='all'>All statuses</SelectItem>
            {ORDER_STATUSES.map((status) => (
              <SelectItem key={status} value={status}>
                {ORDER_STATUS_MAP[status].label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading && !data ? (
        <DataTableSkeleton columnCount={7} rowCount={search.limit} />
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
