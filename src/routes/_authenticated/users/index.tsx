import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { z } from 'zod';

import { usersControllerFindAllOptions } from '@/api/generated/@tanstack/react-query.gen';
import { useDocumentTitle } from '@/hooks/use-document-title';
import {
  DataTable,
  DataTablePagination,
  DataTableSkeleton,
} from '@/components/shared/data-table';
import { PageHeader } from '@/components/shared/page-header';
import { columns } from '@/features/users/components/users-columns';

const usersSearchSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().default(10),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});

export const Route = createFileRoute('/_authenticated/users/')({
  validateSearch: usersSearchSchema,
  component: UsersPage,
});

function UsersPage() {
  useDocumentTitle('Users');
  const search = Route.useSearch();
  const navigate = useNavigate();

  const { data, isLoading } = useQuery({
    ...usersControllerFindAllOptions({
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
      to: '/users',
      search: state,
    });
  };

  return (
    <div className='space-y-6'>
      <PageHeader
        title='Users'
        description='Manage user accounts and permissions'
      />

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
