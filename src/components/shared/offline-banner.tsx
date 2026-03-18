import { useOnlineStatus } from '@/hooks/use-online-status';
import { WifiOff } from 'lucide-react';

const OfflineBanner = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className='bg-destructive text-destructive-foreground flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium'>
      <WifiOff className='h-4 w-4' />
      <span>
        You are offline. Some features may not work until you reconnect.
      </span>
    </div>
  );
};

export { OfflineBanner };
