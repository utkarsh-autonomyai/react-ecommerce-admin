import { useEffect } from 'react';

const SUFFIX = 'Admin';
const DEFAULT_TITLE = 'Admin Dashboard';

export const useDocumentTitle = (title?: string): void => {
  useEffect(() => {
    document.title = title ? `${title} | ${SUFFIX}` : DEFAULT_TITLE;

    return () => {
      document.title = DEFAULT_TITLE;
    };
  }, [title]);
};
