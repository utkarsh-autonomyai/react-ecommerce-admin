import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { Plus } from 'lucide-react';
import { z } from 'zod';

import {
  categoriesControllerFindAllAdminOptions,
  productsControllerFindAllAdminOptions,
} from '@/api/generated/@tanstack/react-query.gen';
import { useDocumentTitle } from '@/hooks/use-document-title';
import {
  DataTable,
  DataTablePagination,
  DataTableSkeleton,
} from '@/components/shared/data-table';
import { PageHeader } from '@/components/shared/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { columns } from '@/features/products/components/products-columns';
import { ADMIN_IS_ACTIVE_FILTER, ADMIN_DROPDOWN_LIMIT } from '@/lib/constants';

const productsSearchSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().default(10),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
  categoryId: z.string().optional(),
  search: z.string().optional(),
});

export const Route = createFileRoute('/_authenticated/products/')({
  validateSearch: productsSearchSchema,
  component: ProductsPage,
});

function ProductsPage() {
  useDocumentTitle('Products');
  const search = Route.useSearch();
  const navigate = useNavigate();

  const { data, isLoading } = useQuery({
    ...productsControllerFindAllAdminOptions({
      query: {
        page: String(search.page),
        limit: String(search.limit),
        sortBy: search.sortBy,
        sortOrder: search.sortOrder,
        categoryId: search.categoryId,
        search: search.search,
        isActive: ADMIN_IS_ACTIVE_FILTER,
      },
    }),
    placeholderData: keepPreviousData,
  });

  const { data: categoriesData } = useQuery({
    ...categoriesControllerFindAllAdminOptions({
      query: { limit: ADMIN_DROPDOWN_LIMIT, isActive: ADMIN_IS_ACTIVE_FILTER },
    }),
  });

  const handleStateChange = (state: {
    page: number;
    limit: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) => {
    navigate({
      to: '/products',
      search: {
        ...state,
        categoryId: search.categoryId,
        search: search.search,
      },
    });
  };

  const handleFilterChange = (
    filters: Partial<{ categoryId: string; search: string }>,
  ) => {
    navigate({
      to: '/products',
      search: {
        ...search,
        ...filters,
        page: 1,
      },
    });
  };

  return (
    <div className='space-y-6'>
      <PageHeader title='Products' description='Manage your product catalog'>
        <Button asChild>
          <Link to='/products/create'>
            <Plus size={16} />
            Create product
          </Link>
        </Button>
      </PageHeader>

      <div className='flex items-center gap-4'>
        <Input
          key={search.search}
          placeholder='Search products...'
          defaultValue={search.search ?? ''}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleFilterChange({
                search: e.currentTarget.value || undefined,
              });
            }
          }}
          onBlur={(e) => {
            const value = e.target.value || undefined;
            if (value !== search.search) {
              handleFilterChange({ search: value });
            }
          }}
          className='max-w-sm'
        />

        <Select
          value={search.categoryId ?? 'all'}
          onValueChange={(value) =>
            handleFilterChange({
              categoryId: value === 'all' ? undefined : value,
            })
          }
        >
          <SelectTrigger className='w-48'>
            <SelectValue placeholder='All categories' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='all'>All categories</SelectItem>
            {(categoriesData?.data ?? []).map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading && !data ? (
        <DataTableSkeleton columnCount={9} rowCount={search.limit} />
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
