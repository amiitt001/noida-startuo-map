/**
 * useSaved Hook
 *
 * Interacts with saveService to provide session-backed bookmarks for authenticated users
 * with fallback & legacy migration.
 */

import { useState, useEffect, useCallback } from 'react';
import { Bookmark } from '../types';
import { saveService } from '../services/saveService';
import { useAuth } from '../context/AuthContext';

export function useSaved() {
  const { isAuthenticated } = useAuth();
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBookmarks = useCallback(async () => {
    setLoading(true);
    try {
      const res = await saveService.getBookmarks(isAuthenticated);
      setBookmarks(res);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchBookmarks();
    const handleUpdate = () => {
      fetchBookmarks();
    };
    window.addEventListener('bookmarks_updated', handleUpdate);
    return () => {
      window.removeEventListener('bookmarks_updated', handleUpdate);
    };
  }, [fetchBookmarks]);

  const isSaved = useCallback(
    (type: Bookmark['type'], itemId: string) => {
      return bookmarks.some((b) => b.type === type && b.itemId === itemId);
    },
    [bookmarks]
  );

  const toggleSave = useCallback(
    async (type: Bookmark['type'], itemId: string) => {
      return saveService.toggleSave(type, itemId, isAuthenticated);
    },
    [isAuthenticated]
  );

  return {
    bookmarks,
    isSaved,
    toggleSave,
    count: bookmarks.length,
    loading,
    refetch: fetchBookmarks,
  };
}
