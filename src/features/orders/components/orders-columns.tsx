import type { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';

import type { OrderListDto } from '@/api/generated/types.gen';
import { DataTableColumnHeader } from '@/components/shared/data-table';
import { MoneyDisplay } from '@/components/shared/money-display';
import { StatusBadge } from '@/components/shared/status-badge';
import { ORDER_STATUS_MAP } from '@/components/shared/status-maps';
import { OrdersActionsCell } from './orders-actions-cell';

export const columns: ColumnDef<OrderListDto, unknown>[] = [
  {
    accessorKey: 'orderNumber',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Order' />
    ),
    cell: ({ getValue }) => (
      <span className='font-mono font-medium'>{getValue() as string}</span>
    ),
  },
  {
    accessorKey: 'status',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Status' />
    ),
    cell: ({ getValue }) => (
      <StatusBadge status={getValue() as string} statusMap={ORDER_STATUS_MAP} />
    ),
  },
  {
    accessorKey: 'total',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Total' />
    ),
    cell: ({ getValue }) => (
      <MoneyDisplay amount={parseFloat(getValue() as string)} />
    ),
  },
  {
    accessorKey: 'subtotal',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Subtotal' />
    ),
    cell: ({ getValue }) => (
      <MoneyDisplay amount={parseFloat(getValue() as string)} />
    ),
  },
  {
    accessorKey: 'shippingCost',
    header: 'Shipping',
    cell: ({ getValue }) => (
      <MoneyDisplay amount={parseFloat(getValue() as string)} />
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
    cell: ({ row }) => <OrdersActionsCell order={row.original} />,
  },
];
