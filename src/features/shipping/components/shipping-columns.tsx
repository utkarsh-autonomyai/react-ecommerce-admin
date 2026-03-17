import type { ColumnDef } from '@tanstack/react-table';

import type { ShippingMethodDto } from '@/api/generated/types.gen';
import { MoneyDisplay } from '@/components/shared/money-display';
import { Badge } from '@/components/ui/badge';
import { ShippingActionsCell } from './shipping-actions-cell';

export const columns: ColumnDef<ShippingMethodDto, unknown>[] = [
  {
    accessorKey: 'name',
    header: 'Name',
    cell: ({ getValue }) => (
      <span className='font-medium'>{getValue() as string}</span>
    ),
  },
  {
    accessorKey: 'basePrice',
    header: 'Base Price',
    cell: ({ getValue }) => (
      <MoneyDisplay amount={parseFloat(getValue() as string)} />
    ),
  },
  {
    accessorKey: 'freeShippingThreshold',
    header: 'Free Above',
    cell: ({ getValue }) => {
      const value = getValue();
      if (value === null || value === undefined) {
        return <span className='text-muted-foreground'>—</span>;
      }
      const amount =
        typeof value === 'string' ? parseFloat(value) : Number(value);
      return Number.isNaN(amount) ? (
        <span className='text-muted-foreground'>—</span>
      ) : (
        <MoneyDisplay amount={amount} />
      );
    },
  },
  {
    accessorKey: 'estimatedDays',
    header: 'Est. Days',
    cell: ({ getValue }) => {
      const days = getValue() as number;
      return `${days} ${days === 1 ? 'day' : 'days'}`;
    },
  },
  {
    accessorKey: 'sortOrder',
    header: 'Sort Order',
  },
  {
    accessorKey: 'isActive',
    header: 'Status',
    cell: ({ getValue }) =>
      getValue() ? (
        <Badge variant='default'>Active</Badge>
      ) : (
        <Badge variant='secondary'>Inactive</Badge>
      ),
  },
  {
    id: 'actions',
    cell: ({ row }) => <ShippingActionsCell method={row.original} />,
  },
];
