import type { ReactNode } from 'react';

import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

type StatCardProps = {
  title: string;
  value: ReactNode;
  description?: string;
  icon: ReactNode;
};

const StatCard = ({ title, value, icon, description }: StatCardProps) => {
  return (
    <Card className='@container'>
      <CardContent className='flex items-center gap-4'>
        <div className='bg-muted flex size-12 shrink-0 items-center justify-center rounded-full'>
          {icon}
        </div>
        <div className='min-w-0'>
          <p className='text-muted-foreground text-sm font-medium'>{title}</p>
          <p
            className='w-fit text-2xl font-bold'
            style={{ fontSize: 'clamp(0.875rem, 3cqi, 1.5rem)' }}
          >
            {value}
          </p>
          {description && (
            <p className='text-muted-foreground text-xs'>{description}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

const StatCardSkeleton = () => {
  return (
    <Card>
      <CardContent className='flex items-center gap-4'>
        <Skeleton className='size-12 rounded-full' />
        <div className='space-y-2'>
          <Skeleton className='h-4 w-24' />
          <Skeleton className='h-7 w-16' />
          <Skeleton className='h-3 w-32' />
        </div>
      </CardContent>
    </Card>
  );
};

export { StatCard, StatCardSkeleton };
