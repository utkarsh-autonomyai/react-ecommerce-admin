import { useState } from 'react';
import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from '@tanstack/react-query';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { toast } from 'sonner';
import { z } from 'zod';

import { useDocumentTitle } from '@/hooks/use-document-title';
import {
  paymentsControllerGetAllPaymentsOptions,
  paymentsControllerGetAllPaymentsQueryKey,
  paymentsControllerExpireAbandonedPaymentsMutation,
} from '@/api/generated/@tanstack/react-query.gen';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import {
  DataTable,
  DataTablePagination,
  DataTableSkeleton,
} from '@/components/shared/data-table';
import { PageHeader } from '@/components/shared/page-header';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PAYMENT_STATUS_MAP } from '@/components/shared/status-maps';
import { columns } from '@/features/payments/components/payments-columns';

const PAYMENT_STATUSES = [
  'PENDING',
  'SUCCEEDED',
  'FAILED',
  'REFUND_PENDING',
  'REFUNDED',
  'PARTIALLY_REFUNDED',
] as const;

const paymentsSearchSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().default(10),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
  status: z.enum(PAYMENT_STATUSES).optional(),
});

export const Route = createFileRoute('/_authenticated/payments/')({
  validateSearch: paymentsSearchSchema,
  component: PaymentsPage,
});

function PaymentsPage() {
  useDocumentTitle('Payments');
  const search = Route.useSearch();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showExpireConfirm, setShowExpireConfirm] = useState(false);

  const { data, isLoading } = useQuery({
    ...paymentsControllerGetAllPaymentsOptions({
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

  const expireMutation = useMutation({
    ...paymentsControllerExpireAbandonedPaymentsMutation(),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: paymentsControllerGetAllPaymentsQueryKey(),
      });
      setShowExpireConfirm(false);
      toast.success('Abandoned payments expired');
    },
  });

  const handleStateChange = (state: {
    page: number;
    limit: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) => {
    navigate({
      to: '/payments',
      search: {
        ...state,
        status: search.status,
      },
    });
  };

  const handleStatusChange = (value: string) => {
    navigate({
      to: '/payments',
      search: {
        ...search,
        status:
          value === 'all'
            ? undefined
            : (value as (typeof PAYMENT_STATUSES)[number]),
        page: 1,
      },
    });
  };

  return (
    <div className='space-y-6'>
      <PageHeader title='Payments' description='View and manage payments'>
        <Button variant='outline' onClick={() => setShowExpireConfirm(true)}>
          Expire Abandoned
        </Button>
      </PageHeader>

      <div className='flex items-center gap-4'>
        <Select
          value={search.status ?? 'all'}
          onValueChange={handleStatusChange}
        >
          <SelectTrigger className='w-56'>
            <SelectValue placeholder='All statuses' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='all'>All statuses</SelectItem>
            {PAYMENT_STATUSES.map((status) => (
              <SelectItem key={status} value={status}>
                {PAYMENT_STATUS_MAP[status].label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading && !data ? (
        <DataTableSkeleton columnCount={6} rowCount={search.limit} />
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

      <ConfirmDialog
        open={showExpireConfirm}
        onOpenChange={setShowExpireConfirm}
        title='Expire Abandoned Payments'
        description='This will expire all pending payments that have not been completed within the timeout period. This action cannot be undone.'
        confirmLabel='Expire'
        variant='destructive'
        isLoading={expireMutation.isPending}
        onConfirm={() => expireMutation.mutate({})}
      />
    </div>
  );
}
