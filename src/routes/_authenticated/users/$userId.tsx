import { useQuery } from '@tanstack/react-query';
import { createFileRoute, Link } from '@tanstack/react-router';
import { ArrowLeft } from 'lucide-react';
import { format } from 'date-fns';

import { usersControllerFindByIdOptions } from '@/api/generated/@tanstack/react-query.gen';
import { useDocumentTitle } from '@/hooks/use-document-title';
import { PageHeader } from '@/components/shared/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { UserForm } from '@/features/users/components/user-form';

export const Route = createFileRoute('/_authenticated/users/$userId')({
  component: UserDetailPage,
});

function UserDetailPage() {
  const { userId } = Route.useParams();

  const { data, isLoading } = useQuery(
    usersControllerFindByIdOptions({ path: { id: userId } }),
  );

  const user = data?.data;
  useDocumentTitle(
    user
      ? [user.firstName, user.lastName].filter(Boolean).join(' ') || user.email
      : undefined,
  );

  if (isLoading) {
    return (
      <div className='space-y-6'>
        <Skeleton className='h-10 w-48' />
        <Skeleton className='h-96 w-full' />
      </div>
    );
  }

  if (!user) {
    return <div>User not found.</div>;
  }

  return (
    <div className='space-y-6'>
      <PageHeader
        title={
          [user.firstName, user.lastName].filter(Boolean).join(' ') ||
          user.email
        }
        description={user.email}
      >
        <Button variant='outline' asChild>
          <Link to='/users'>
            <ArrowLeft size={16} />
            Back to users
          </Link>
        </Button>
      </PageHeader>

      <div className='grid grid-cols-1 gap-6 lg:grid-cols-3'>
        <div className='lg:col-span-2'>
          <UserForm user={user} />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Account Info</CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div>
              <p className='text-muted-foreground text-sm'>User ID</p>
              <p className='font-mono text-sm'>{user.id}</p>
            </div>
            <div>
              <p className='text-muted-foreground text-sm'>Created</p>
              <p className='text-sm'>
                {format(new Date(user.createdAt), 'PPP p')}
              </p>
            </div>
            <div>
              <p className='text-muted-foreground text-sm'>Last updated</p>
              <p className='text-sm'>
                {format(new Date(user.updatedAt), 'PPP p')}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
