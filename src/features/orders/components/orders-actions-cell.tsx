import { useNavigate } from '@tanstack/react-router';
import { Eye, MoreHorizontal } from 'lucide-react';

import type { OrderListDto } from '@/api/generated/types.gen';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

type OrdersActionsCellProps = {
  order: OrderListDto;
};

export const OrdersActionsCell = ({ order }: OrdersActionsCellProps) => {
  const navigate = useNavigate();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant='ghost' size='icon' className='h-8 w-8'>
          <MoreHorizontal size={16} />
          <span className='sr-only'>Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end'>
        <DropdownMenuItem
          onClick={() =>
            navigate({
              to: '/orders/$orderId',
              params: { orderId: order.id },
            })
          }
        >
          <Eye size={14} />
          View details
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
