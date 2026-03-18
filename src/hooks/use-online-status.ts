import { useSyncExternalStore } from 'react';

const subscribe = (callback: () => void): (() => void) => {
  window.addEventListener('online', callback);
  window.addEventListener('offline', callback);
  return () => {
    window.removeEventListener('online', callback);
    window.removeEventListener('offline', callback);
  };
};

const getSnapshot = (): boolean => navigator.onLine;

const useOnlineStatus = (): boolean => {
  return useSyncExternalStore(subscribe, getSnapshot);
};

export { useOnlineStatus };
