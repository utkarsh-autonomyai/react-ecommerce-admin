import type { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';

import type { NotificationDto } from '@/api/generated/types.gen';
import { DataTableColumnHeader } from '@/components/shared/data-table';
import { StatusBadge } from '@/components/shared/status-badge';
import { NOTIFICATION_TYPE_MAP } from '@/components/shared/status-maps';
import { Badge } from '@/components/ui/badge';
import { NotificationsActionsCell } from './notifications-actions-cell';

export const columns: ColumnDef<NotificationDto, unknown>[] = [
  {
    accessorKey: 'type',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Type' />
    ),
    cell: ({ getValue }) => (
      <StatusBadge
        status={getValue() as string}
        statusMap={NOTIFICATION_TYPE_MAP}
      />
    ),
  },
  {
    accessorKey: 'title',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Title' />
    ),
    cell: ({ getValue }) => (
      <span className='font-medium'>{getValue() as string}</span>
    ),
  },
  {
    accessorKey: 'body',
    header: 'Message',
    cell: ({ getValue }) => (
      <span className='text-muted-foreground block max-w-xs truncate text-sm'>
        {getValue() as string}
      </span>
    ),
  },
  {
    accessorKey: 'isRead',
    header: 'Status',
    cell: ({ getValue }) =>
      getValue() ? (
        <Badge variant='secondary'>Read</Badge>
      ) : (
        <Badge variant='default'>Unread</Badge>
      ),
  },
  {
    accessorKey: 'createdAt',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Date' />
    ),
    cell: ({ getValue }) =>
      format(new Date(getValue() as string), 'MMM d, yyyy HH:mm'),
  },
  {
    id: 'actions',
    cell: ({ row }) => <NotificationsActionsCell notification={row.original} />,
  },
];
