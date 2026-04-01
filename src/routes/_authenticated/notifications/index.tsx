import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { z } from 'zod';

import { notificationsControllerFindAllOptions } from '@/api/generated/@tanstack/react-query.gen';
import { useDocumentTitle } from '@/hooks/use-document-title';
import type { NotificationDto } from '@/api/generated/types.gen';
import {
  DataTable,
  DataTablePagination,
  DataTableSkeleton,
} from '@/components/shared/data-table';
import { PageHeader } from '@/components/shared/page-header';
import {
  NOTIFICATION_TYPE_MAP,
  NOTIFICATION_TYPES,
} from '@/components/shared/status-maps';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { columns } from '@/features/notifications/components/notifications-columns';

const READ_STATUSES = ['true', 'false'] as const;

const notificationsSearchSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().default(10),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
  type: z.string().optional(),
  isRead: z.enum(READ_STATUSES).optional(),
});

export const Route = createFileRoute('/_authenticated/notifications/')({
  validateSearch: notificationsSearchSchema,
  component: NotificationsPage,
});

function NotificationsPage() {
  useDocumentTitle('Notifications');
  const search = Route.useSearch();
  const navigate = useNavigate();

  const { data, isLoading } = useQuery({
    ...notificationsControllerFindAllOptions({
      query: {
        page: String(search.page),
        limit: String(search.limit),
        sortBy: search.sortBy,
        sortOrder: search.sortOrder,
        type: search.type as NotificationDto['type'] | undefined,
        isRead: search.isRead,
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
      to: '/notifications',
      search: {
        ...state,
        type: search.type,
        isRead: search.isRead,
      },
    });
  };

  const handleFilterChange = (key: 'type' | 'isRead', value: string) => {
    navigate({
      to: '/notifications',
      search: {
        ...search,
        [key]: value === 'all' ? undefined : value,
        page: 1,
      },
    });
  };

  return (
    <div className='space-y-6'>
      <PageHeader
        title='Notifications'
        description='View all system notifications across users'
      />

      <div className='flex flex-wrap items-center gap-4'>
        <Select
          value={search.type ?? 'all'}
          onValueChange={(v) => handleFilterChange('type', v)}
        >
          <SelectTrigger className='w-56'>
            <SelectValue placeholder='All types' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='all'>All types</SelectItem>
            {NOTIFICATION_TYPES.map((type) => (
              <SelectItem key={type} value={type}>
                {NOTIFICATION_TYPE_MAP[type].label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={search.isRead ?? 'all'}
          onValueChange={(v) => handleFilterChange('isRead', v)}
        >
          <SelectTrigger className='w-40'>
            <SelectValue placeholder='All statuses' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='all'>All statuses</SelectItem>
            <SelectItem value='false'>Unread</SelectItem>
            <SelectItem value='true'>Read</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading && !data ? (
        <DataTableSkeleton columnCount={5} rowCount={search.limit} />
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
