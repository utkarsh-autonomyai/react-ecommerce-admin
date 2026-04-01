import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { z } from 'zod';

import { reviewsControllerFindAllOptions } from '@/api/generated/@tanstack/react-query.gen';
import { useDocumentTitle } from '@/hooks/use-document-title';
import {
  DataTable,
  DataTablePagination,
  DataTableSkeleton,
} from '@/components/shared/data-table';
import { PageHeader } from '@/components/shared/page-header';
import { REVIEW_STATUS_MAP } from '@/components/shared/status-maps';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { columns } from '@/features/reviews/components/reviews-columns';

const REVIEW_STATUSES = ['PENDING', 'APPROVED', 'REJECTED'] as const;
const RATINGS = [1, 2, 3, 4, 5] as const;

const reviewsSearchSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().default(10),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
  status: z.enum(REVIEW_STATUSES).optional(),
  rating: z.coerce.number().int().min(1).max(5).optional(),
});

export const Route = createFileRoute('/_authenticated/reviews/')({
  validateSearch: reviewsSearchSchema,
  component: ReviewsPage,
});

function ReviewsPage() {
  useDocumentTitle('Reviews');
  const search = Route.useSearch();
  const navigate = useNavigate();

  const { data, isLoading } = useQuery({
    ...reviewsControllerFindAllOptions({
      query: {
        page: String(search.page),
        limit: String(search.limit),
        sortBy: search.sortBy,
        sortOrder: search.sortOrder,
        status: search.status,
        rating: search.rating,
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
      to: '/reviews',
      search: {
        ...state,
        status: search.status,
        rating: search.rating,
      },
    });
  };

  const handleFilterChange = (key: 'status' | 'rating', value: string) => {
    navigate({
      to: '/reviews',
      search: {
        ...search,
        [key]:
          value === 'all'
            ? undefined
            : key === 'rating'
              ? Number(value)
              : value,
        page: 1,
      },
    });
  };

  return (
    <div className='space-y-6'>
      <PageHeader
        title='Reviews'
        description='Moderate and manage customer reviews'
      />

      <div className='flex flex-wrap items-center gap-4'>
        <Select
          value={search.status ?? 'all'}
          onValueChange={(v) => handleFilterChange('status', v)}
        >
          <SelectTrigger className='w-48'>
            <SelectValue placeholder='All statuses' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='all'>All statuses</SelectItem>
            {REVIEW_STATUSES.map((status) => (
              <SelectItem key={status} value={status}>
                {REVIEW_STATUS_MAP[status].label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={search.rating !== undefined ? String(search.rating) : 'all'}
          onValueChange={(v) => handleFilterChange('rating', v)}
        >
          <SelectTrigger className='w-40'>
            <SelectValue placeholder='All ratings' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='all'>All ratings</SelectItem>
            {RATINGS.map((r) => (
              <SelectItem key={r} value={String(r)}>
                {r} {r === 1 ? 'star' : 'stars'}
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
    </div>
  );
}
