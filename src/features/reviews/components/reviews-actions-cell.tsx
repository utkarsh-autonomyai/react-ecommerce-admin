import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Check, MoreHorizontal, Scale, Trash2, X } from 'lucide-react';

import {
  reviewsControllerAdminUpdateMutation,
  reviewsControllerAdminDeleteMutation,
  reviewsControllerFindAllQueryKey,
} from '@/api/generated/@tanstack/react-query.gen';
import type { ReviewDto } from '@/api/generated/types.gen';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ModerateDialog } from './moderate-dialog';

type ReviewsActionsCellProps = {
  review: ReviewDto;
};

export const ReviewsActionsCell = ({ review }: ReviewsActionsCellProps) => {
  const queryClient = useQueryClient();
  const [showModerate, setShowModerate] = useState(false);
  const [showDelete, setShowDelete] = useState(false);

  const moderateMutation = useMutation({
    ...reviewsControllerAdminUpdateMutation(),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: reviewsControllerFindAllQueryKey(),
      });
    },
  });

  const deleteMutation = useMutation({
    ...reviewsControllerAdminDeleteMutation(),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: reviewsControllerFindAllQueryKey(),
      });
      setShowDelete(false);
    },
  });

  const isReviewPending = review.status === 'PENDING';

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
          {isReviewPending && (
            <>
              <DropdownMenuItem
                disabled={moderateMutation.isPending}
                onClick={() =>
                  moderateMutation.mutate({
                    path: { id: review.id },
                    body: { status: 'APPROVED' },
                  })
                }
              >
                <Check size={14} />
                {moderateMutation.isPending ? 'Approving...' : 'Approve'}
              </DropdownMenuItem>
              <DropdownMenuItem
                className='text-destructive'
                disabled={moderateMutation.isPending}
                onClick={() =>
                  moderateMutation.mutate({
                    path: { id: review.id },
                    body: { status: 'REJECTED' },
                  })
                }
              >
                <X size={14} />
                {moderateMutation.isPending ? 'Rejecting...' : 'Reject'}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
            </>
          )}
          <DropdownMenuItem onClick={() => setShowModerate(true)}>
            <Scale size={14} />
            Moderate
          </DropdownMenuItem>
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

      <ModerateDialog
        review={review}
        open={showModerate}
        onOpenChange={setShowModerate}
      />

      <ConfirmDialog
        open={showDelete}
        onOpenChange={setShowDelete}
        title='Delete Review'
        description={`Are you sure you want to permanently delete this review by ${typeof review.user.firstName === 'string' ? review.user.firstName : 'this user'}? This action cannot be undone.`}
        confirmLabel='Delete'
        variant='destructive'
        isLoading={deleteMutation.isPending}
        onConfirm={() => deleteMutation.mutate({ path: { id: review.id } })}
      />
    </>
  );
};
