import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { Plus } from 'lucide-react';
import { z } from 'zod';

import { categoriesControllerFindAllAdminOptions } from '@/api/generated/@tanstack/react-query.gen';
import {
  DataTable,
  DataTablePagination,
  DataTableSkeleton,
} from '@/components/shared/data-table';
import { PageHeader } from '@/components/shared/page-header';
import { Button } from '@/components/ui/button';
import { columns } from '@/features/categories/components/categories-columns';

const categoriesSearchSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().default(10),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});

export const Route = createFileRoute('/_authenticated/categories/')({
  validateSearch: categoriesSearchSchema,
  component: CategoriesPage,
});

function CategoriesPage() {
  const search = Route.useSearch();
  const navigate = useNavigate();

  const { data, isLoading } = useQuery({
    ...categoriesControllerFindAllAdminOptions({
      query: {
        page: String(search.page),
        limit: String(search.limit),
        sortBy: search.sortBy,
        sortOrder: search.sortOrder,
        isActive: 'all',
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
      to: '/categories',
      search: state,
    });
  };

  return (
    <div className='space-y-6'>
      <PageHeader
        title='Categories'
        description='Manage product categories and their hierarchy'
      >
        <Button asChild>
          <Link to='/categories/create'>
            <Plus size={16} />
            Create category
          </Link>
        </Button>
      </PageHeader>

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
