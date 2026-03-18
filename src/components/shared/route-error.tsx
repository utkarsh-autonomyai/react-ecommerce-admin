import type { ErrorComponentProps } from '@tanstack/react-router';
import { useRouter } from '@tanstack/react-router';

const RouteError = ({ error, reset }: ErrorComponentProps) => {
  const router = useRouter();

  const handleRetry = () => {
    reset();
    router.invalidate();
  };

  return (
    <div className='flex h-full min-h-[400px] flex-col items-center justify-center gap-4 p-8'>
      <div className='flex flex-col items-center gap-2'>
        <h2 className='text-2xl font-bold'>Failed to load page</h2>
        <p className='text-muted-foreground max-w-md text-center'>
          {error.message ||
            'An unexpected error occurred while loading this page.'}
        </p>
      </div>
      <button
        onClick={handleRetry}
        className='bg-primary text-primary-foreground hover:bg-primary/90 rounded-md px-4 py-2 text-sm font-medium'
      >
        Retry
      </button>
    </div>
  );
};

export { RouteError };
