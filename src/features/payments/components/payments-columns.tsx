import type { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';

import type { PaymentWithOrderDto } from '@/api/generated/types.gen';
import { DataTableColumnHeader } from '@/components/shared/data-table';
import { MoneyDisplay } from '@/components/shared/money-display';
import { StatusBadge } from '@/components/shared/status-badge';
import { PAYMENT_STATUS_MAP } from '@/components/shared/status-maps';
import { PaymentsActionsCell } from './payments-actions-cell';

export const columns: ColumnDef<PaymentWithOrderDto, unknown>[] = [
  {
    id: 'orderNumber',
    accessorFn: (row) => row.order.orderNumber,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Order' />
    ),
    cell: ({ getValue }) => (
      <span className='font-mono font-medium'>{getValue() as string}</span>
    ),
  },
  {
    accessorKey: 'amount',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Amount' />
    ),
    cell: ({ getValue }) => (
      <MoneyDisplay amount={parseFloat(getValue() as string)} />
    ),
  },
  {
    accessorKey: 'status',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Status' />
    ),
    cell: ({ getValue }) => (
      <StatusBadge
        status={getValue() as string}
        statusMap={PAYMENT_STATUS_MAP}
      />
    ),
  },
  {
    accessorKey: 'refundedAmount',
    header: 'Refunded',
    cell: ({ getValue }) => {
      const amount = parseFloat(getValue() as string);
      return amount > 0 ? (
        <MoneyDisplay amount={amount} className='text-destructive' />
      ) : (
        <span className='text-muted-foreground'>—</span>
      );
    },
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
    cell: ({ row }) => <PaymentsActionsCell payment={row.original} />,
  },
];
