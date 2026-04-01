import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { Plus } from 'lucide-react';
import { z } from 'zod';

import { couponsControllerFindAllOptions } from '@/api/generated/@tanstack/react-query.gen';
import { useDocumentTitle } from '@/hooks/use-document-title';
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
import { columns } from '@/features/coupons/components/coupons-columns';

const COUPON_TYPES = ['PERCENTAGE', 'FIXED_AMOUNT'] as const;

const couponsSearchSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().default(10),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
  isActive: z.enum(['true', 'false']).optional(),
  type: z.enum(COUPON_TYPES).optional(),
  validNow: z.enum(['true', 'false']).optional(),
});

export const Route = createFileRoute('/_authenticated/coupons/')({
  validateSearch: couponsSearchSchema,
  component: CouponsPage,
});

function CouponsPage() {
  useDocumentTitle('Coupons');
  const search = Route.useSearch();
  const navigate = useNavigate();

  const { data, isLoading } = useQuery({
    ...couponsControllerFindAllOptions({
      query: {
        page: String(search.page),
        limit: String(search.limit),
        sortBy: search.sortBy,
        sortOrder: search.sortOrder,
        isActive: search.isActive,
        type: search.type,
        validNow: search.validNow,
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
      to: '/coupons',
      search: {
        ...state,
        isActive: search.isActive,
        type: search.type,
        validNow: search.validNow,
      },
    });
  };

  const handleFilterChange = (
    key: 'isActive' | 'type' | 'validNow',
    value: string,
  ) => {
    navigate({
      to: '/coupons',
      search: {
        ...search,
        [key]: value === 'all' ? undefined : value,
        page: 1,
      },
    });
  };

  return (
    <div className='space-y-6'>
      <PageHeader title='Coupons' description='Manage discount coupons'>
        <Button asChild>
          <Link to='/coupons/create'>
            <Plus size={16} />
            Create Coupon
          </Link>
        </Button>
      </PageHeader>

      <div className='flex flex-wrap items-center gap-4'>
        <Select
          value={search.type ?? 'all'}
          onValueChange={(v) => handleFilterChange('type', v)}
        >
          <SelectTrigger className='w-48'>
            <SelectValue placeholder='All types' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='all'>All types</SelectItem>
            {COUPON_TYPES.map((t) => (
              <SelectItem key={t} value={t}>
                {t === 'PERCENTAGE' ? 'Percentage' : 'Fixed Amount'}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={search.isActive ?? 'all'}
          onValueChange={(v) => handleFilterChange('isActive', v)}
        >
          <SelectTrigger className='w-40'>
            <SelectValue placeholder='All statuses' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='all'>All statuses</SelectItem>
            <SelectItem value='true'>Active</SelectItem>
            <SelectItem value='false'>Inactive</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={search.validNow ?? 'all'}
          onValueChange={(v) => handleFilterChange('validNow', v)}
        >
          <SelectTrigger className='w-40'>
            <SelectValue placeholder='Any validity' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='all'>Any validity</SelectItem>
            <SelectItem value='true'>Valid now</SelectItem>
            <SelectItem value='false'>Not valid now</SelectItem>
          </SelectContent>
        </Select>
      </div>

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
