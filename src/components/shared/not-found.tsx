import { Link } from '@tanstack/react-router';
import { useDocumentTitle } from '@/hooks/use-document-title';

const NotFound = () => {
  useDocumentTitle('Not Found');
  return (
    <div className='flex h-screen flex-col items-center justify-center gap-4'>
      <h1 className='text-4xl font-bold'>404</h1>
      <p className='text-muted-foreground'>Page not found</p>
      <Link to='/' className='text-primary underline'>
        Go to Dashboard
      </Link>
    </div>
  );
};

export { NotFound };
