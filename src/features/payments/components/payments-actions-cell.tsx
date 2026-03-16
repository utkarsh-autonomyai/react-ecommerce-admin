import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Eye, MoreHorizontal, RotateCcw } from 'lucide-react';

import type { PaymentWithOrderDto } from '@/api/generated/types.gen';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { RefundDialog } from './refund-dialog';

type PaymentsActionsCellProps = {
  payment: PaymentWithOrderDto;
};

const REFUNDABLE_STATUSES = ['SUCCEEDED', 'PARTIALLY_REFUNDED'];

export const PaymentsActionsCell = ({ payment }: PaymentsActionsCellProps) => {
  const navigate = useNavigate();
  const [showRefund, setShowRefund] = useState(false);

  const isRefundable = REFUNDABLE_STATUSES.includes(payment.status);

  return (
    <>
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
                params: { orderId: payment.orderId },
              })
            }
          >
            <Eye size={14} />
            View order
          </DropdownMenuItem>
          {isRefundable && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className='text-destructive'
                onClick={() => setShowRefund(true)}
              >
                <RotateCcw size={14} />
                Refund
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {isRefundable && (
        <RefundDialog
          payment={payment}
          open={showRefund}
          onOpenChange={setShowRefund}
        />
      )}
    </>
  );
};
