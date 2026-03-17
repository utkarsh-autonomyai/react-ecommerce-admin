import type { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';

import type { ReviewDto } from '@/api/generated/types.gen';
import { DataTableColumnHeader } from '@/components/shared/data-table';
import { StatusBadge } from '@/components/shared/status-badge';
import { REVIEW_STATUS_MAP } from '@/components/shared/status-maps';
import { RatingStars } from './rating-stars';
import { ReviewsActionsCell } from './reviews-actions-cell';

export const columns: ColumnDef<ReviewDto, unknown>[] = [
  {
    id: 'product',
    accessorFn: (row) => row.product.name,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Product' />
    ),
    cell: ({ getValue }) => (
      <span className='font-medium'>{getValue() as string}</span>
    ),
  },
  {
    id: 'customer',
    accessorFn: (row) => {
      const first =
        typeof row.user.firstName === 'string' ? row.user.firstName : '';
      const last =
        typeof row.user.lastName === 'string' ? row.user.lastName : '';
      return `${first} ${last}`.trim() || 'Anonymous';
    },
    header: 'Customer',
  },
  {
    accessorKey: 'rating',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Rating' />
    ),
    cell: ({ getValue }) => <RatingStars rating={getValue() as number} />,
  },
  {
    accessorKey: 'status',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Status' />
    ),
    cell: ({ getValue }) => (
      <StatusBadge
        status={getValue() as string}
        statusMap={REVIEW_STATUS_MAP}
      />
    ),
  },
  {
    accessorKey: 'createdAt',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Date' />
    ),
    cell: ({ getValue }) =>
      format(new Date(getValue() as string), 'MMM d, yyyy'),
  },
  {
    id: 'actions',
    cell: ({ row }) => <ReviewsActionsCell review={row.original} />,
  },
];
