import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import {
  reviewsControllerAdminUpdateMutation,
  reviewsControllerFindAllQueryKey,
} from '@/api/generated/@tanstack/react-query.gen';
import type { ReviewDto } from '@/api/generated/types.gen';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';

const ADMIN_NOTE_MAX_LENGTH = 500;

type ModerateDialogProps = {
  review: ReviewDto;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export const ModerateDialog = ({
  review,
  open,
  onOpenChange,
}: ModerateDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {open && (
        <ModerateDialogContent review={review} onOpenChange={onOpenChange} />
      )}
    </Dialog>
  );
};

type ModerateDialogContentProps = {
  review: ReviewDto;
  onOpenChange: (open: boolean) => void;
};

const ModerateDialogContent = ({
  review,
  onOpenChange,
}: ModerateDialogContentProps) => {
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<'APPROVED' | 'REJECTED'>(
    review.status === 'REJECTED' ? 'REJECTED' : 'APPROVED',
  );
  const [adminNote, setAdminNote] = useState(
    typeof review.adminNote === 'string' ? review.adminNote : '',
  );

  const moderateMutation = useMutation({
    ...reviewsControllerAdminUpdateMutation(),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: reviewsControllerFindAllQueryKey(),
      });
      onOpenChange(false);
    },
  });

  const handleSubmit = () => {
    moderateMutation.mutate({
      path: { id: review.id },
      body: {
        status,
        adminNote: adminNote.trim() || null,
      },
    });
  };

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Moderate Review</DialogTitle>
        <DialogDescription>
          Review by{' '}
          {typeof review.user.firstName === 'string'
            ? review.user.firstName
            : 'Anonymous'}{' '}
          for {review.product.name}
        </DialogDescription>
      </DialogHeader>

      {typeof review.comment === 'string' && (
        <div className='bg-muted rounded-md p-3'>
          <p className='text-sm italic'>&ldquo;{review.comment}&rdquo;</p>
        </div>
      )}

      <div className='space-y-4'>
        <div className='space-y-2'>
          <Label>Decision</Label>
          <RadioGroup
            value={status}
            onValueChange={(v) => setStatus(v as 'APPROVED' | 'REJECTED')}
          >
            <div className='flex items-center gap-2'>
              <RadioGroupItem value='APPROVED' id='approve' />
              <Label htmlFor='approve' className='font-normal'>
                Approve
              </Label>
            </div>
            <div className='flex items-center gap-2'>
              <RadioGroupItem value='REJECTED' id='reject' />
              <Label htmlFor='reject' className='font-normal'>
                Reject
              </Label>
            </div>
          </RadioGroup>
        </div>

        <div className='space-y-2'>
          <Label htmlFor='adminNote'>Admin Note (optional)</Label>
          <Textarea
            id='adminNote'
            rows={3}
            placeholder='Reason for approval/rejection...'
            maxLength={ADMIN_NOTE_MAX_LENGTH}
            value={adminNote}
            onChange={(e) => setAdminNote(e.target.value)}
          />
          <p className='text-muted-foreground text-xs'>
            {adminNote.length}/{ADMIN_NOTE_MAX_LENGTH}
          </p>
        </div>
      </div>

      <DialogFooter>
        <Button variant='outline' onClick={() => onOpenChange(false)}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={moderateMutation.isPending}
          variant={status === 'REJECTED' ? 'destructive' : 'default'}
        >
          {moderateMutation.isPending
            ? 'Saving...'
            : status === 'APPROVED'
              ? 'Approve'
              : 'Reject'}
        </Button>
      </DialogFooter>
    </DialogContent>
  );
};
