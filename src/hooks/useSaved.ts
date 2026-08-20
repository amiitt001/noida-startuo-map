import { useState, useEffect, useCallback } from 'react';
import { Bookmark } from '../types';
import { saveService } from '../services/saveService';

export function useSaved() {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>(() => saveService.getBookmarks());

  useEffect(() => {
    const handleUpdate = () => {
      setBookmarks(saveService.getBookmarks());
    };
    window.addEventListener('bookmarks_updated', handleUpdate);
    return () => {
      window.removeEventListener('bookmarks_updated', handleUpdate);
    };
  }, []);

  const isSaved = useCallback((type: Bookmark['type'], itemId: string) => {
    return bookmarks.some(b => b.type === type && b.itemId === itemId);
  }, [bookmarks]);

  const toggleSave = useCallback((type: Bookmark['type'], itemId: string) => {
    return saveService.toggleSave(type, itemId);
  }, []);

  return {
    bookmarks,
    isSaved,
    toggleSave,
    count: bookmarks.length,
  };
}
