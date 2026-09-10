import { useState, useCallback, useEffect } from 'react';
import type { Page } from '@/types';

export function useRouter() {
  const [page, setPage] = useState<Page>({ name: 'home' });

  const navigate = useCallback((newPage: Page) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  useEffect(() => {
    const handlePopState = (e: PopStateEvent) => {
      if (e.state?.page) {
        setPage(e.state.page);
      } else {
        setPage({ name: 'home' });
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => {
    window.history.pushState({ page }, '');
  }, [page]);

  return { page, navigate };
}
