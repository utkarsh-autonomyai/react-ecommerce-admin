import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { Edit, MoreHorizontal, Power, Trash2 } from 'lucide-react';

import {
  shippingControllerDeactivateMutation,
  shippingControllerHardDeleteMutation,
  shippingControllerFindAllQueryKey,
} from '@/api/generated/@tanstack/react-query.gen';
import type { ShippingMethodDto } from '@/api/generated/types.gen';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

type ShippingActionsCellProps = {
  method: ShippingMethodDto;
};

export const ShippingActionsCell = ({ method }: ShippingActionsCellProps) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showDeactivate, setShowDeactivate] = useState(false);
  const [showDelete, setShowDelete] = useState(false);

  const deactivateMutation = useMutation({
    ...shippingControllerDeactivateMutation(),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: shippingControllerFindAllQueryKey(),
      });
      setShowDeactivate(false);
    },
  });

  const deleteMutation = useMutation({
    ...shippingControllerHardDeleteMutation(),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: shippingControllerFindAllQueryKey(),
      });
      setShowDelete(false);
    },
  });

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
                to: '/shipping/$shippingId',
                params: { shippingId: method.id },
              })
            }
          >
            <Edit size={14} />
            Edit
          </DropdownMenuItem>
          {method.isActive && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className='text-destructive'
                onClick={() => setShowDeactivate(true)}
              >
                <Power size={14} />
                Deactivate
              </DropdownMenuItem>
            </>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className='text-destructive'
            onClick={() => setShowDelete(true)}
          >
            <Trash2 size={14} />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ConfirmDialog
        open={showDeactivate}
        onOpenChange={setShowDeactivate}
        title='Deactivate Shipping Method'
        description={`Are you sure you want to deactivate "${method.name}"? It will no longer be available at checkout.`}
        confirmLabel='Deactivate'
        variant='destructive'
        isLoading={deactivateMutation.isPending}
        onConfirm={() => deactivateMutation.mutate({ path: { id: method.id } })}
      />

      <ConfirmDialog
        open={showDelete}
        onOpenChange={setShowDelete}
        title='Delete Shipping Method'
        description={`Are you sure you want to permanently delete "${method.name}"? This action cannot be undone.`}
        confirmLabel='Delete'
        variant='destructive'
        isLoading={deleteMutation.isPending}
        onConfirm={() => deleteMutation.mutate({ path: { id: method.id } })}
      />
    </>
  );
};
