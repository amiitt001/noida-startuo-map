import { Bookmark } from '../types';
import { storageService } from './storageService';

const BOOKMARKS_KEY = 'noida_atlas_bookmarks_v1';

export const saveService = {
  getBookmarks(): Bookmark[] {
    return storageService.getItem<Bookmark[]>(BOOKMARKS_KEY, []);
  },

  isSaved(type: Bookmark['type'], itemId: string): boolean {
    const bookmarks = this.getBookmarks();
    return bookmarks.some(b => b.type === type && b.itemId === itemId);
  },

  toggleSave(type: Bookmark['type'], itemId: string): boolean {
    const bookmarks = this.getBookmarks();
    const existingIndex = bookmarks.findIndex(b => b.type === type && b.itemId === itemId);

    let updated: Bookmark[];
    let isNowSaved = false;

    if (existingIndex >= 0) {
      updated = bookmarks.filter((_, idx) => idx !== existingIndex);
      isNowSaved = false;
    } else {
      updated = [
        ...bookmarks,
        {
          id: `bm_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
          type,
          itemId,
          createdAt: new Date().toISOString(),
        }
      ];
      isNowSaved = true;
    }

    storageService.setItem(BOOKMARKS_KEY, updated);
    window.dispatchEvent(new CustomEvent('bookmarks_updated', { detail: { type, itemId, isNowSaved } }));
    return isNowSaved;
  },

  getSaveCount(type?: Bookmark['type']): number {
    const bookmarks = this.getBookmarks();
    if (!type) return bookmarks.length;
    return bookmarks.filter(b => b.type === type).length;
  }
};
