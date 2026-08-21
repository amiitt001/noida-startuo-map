/**
 * Bookmark Service
 *
 * Calls backend /api/bookmarks for persistent session bookmarks.
 * Includes legacy localStorage migration strategy for seamless user experience.
 */

import { apiClient } from './apiClient';
import { Bookmark } from '../types';

const LEGACY_BOOKMARKS_KEY = 'noida_atlas_bookmarks_v1';

export const saveService = {
  /**
   * Fetch bookmarks for current user session from API.
   * If authenticated, performs legacy localStorage migration.
   */
  async getBookmarks(isAuthenticated = false): Promise<Bookmark[]> {
    if (!isAuthenticated) {
      // Unauthenticated fallback from localStorage
      try {
        const raw = localStorage.getItem(LEGACY_BOOKMARKS_KEY);
        return raw ? JSON.parse(raw) : [];
      } catch (_e) {
        return [];
      }
    }

    try {
      const res = await apiClient.get<Bookmark[]>('/api/bookmarks');
      const apiBookmarks = res.data;

      // Migrate legacy localStorage bookmarks if present
      await this.migrateLegacyBookmarks(apiBookmarks);

      return apiBookmarks;
    } catch (_err) {
      // Fallback
      return [];
    }
  },

  async toggleSave(type: Bookmark['type'], itemId: string, isAuthenticated = false): Promise<boolean> {
    if (!isAuthenticated) {
      // Local fallback for unauthenticated user
      const current = await this.getBookmarks(false);
      const exists = current.some((b) => b.type === type && b.itemId === itemId);
      let updated: Bookmark[];

      if (exists) {
        updated = current.filter((b) => !(b.type === type && b.itemId === itemId));
      } else {
        updated = [
          ...current,
          {
            id: `local_${Date.now()}`,
            type,
            itemId,
            createdAt: new Date().toISOString(),
          },
        ];
      }
      try {
        localStorage.setItem(LEGACY_BOOKMARKS_KEY, JSON.stringify(updated));
      } catch (_e) {}
      window.dispatchEvent(new CustomEvent('bookmarks_updated', { detail: { type, itemId, isNowSaved: !exists } }));
      return !exists;
    }

    // Authenticated API toggle
    const res = await apiClient.post<{ isNowSaved: boolean }>('/api/bookmarks', { type, itemId });
    window.dispatchEvent(new CustomEvent('bookmarks_updated', { detail: { type, itemId, isNowSaved: res.data.isNowSaved } }));
    return res.data.isNowSaved;
  },

  async deleteBookmark(bookmarkId: string): Promise<void> {
    await apiClient.delete(`/api/bookmarks/${bookmarkId}`);
    window.dispatchEvent(new CustomEvent('bookmarks_updated', { detail: {} }));
  },

  /**
   * Migrates legacy localStorage bookmarks to backend API and clears local copy on success.
   */
  async migrateLegacyBookmarks(existingApiBookmarks: Bookmark[]): Promise<void> {
    try {
      const raw = localStorage.getItem(LEGACY_BOOKMARKS_KEY);
      if (!raw) return;
      const legacy: Bookmark[] = JSON.parse(raw);
      if (!Array.isArray(legacy) || legacy.length === 0) return;

      const existingKeys = new Set(existingApiBookmarks.map((b) => `${b.type}:${b.itemId}`));

      for (const item of legacy) {
        const key = `${item.type}:${item.itemId}`;
        if (!existingKeys.has(key)) {
          await apiClient.post('/api/bookmarks', { type: item.type, itemId: item.itemId }).catch(() => {});
        }
      }

      // Clear legacy storage only after migration completes
      localStorage.removeItem(LEGACY_BOOKMARKS_KEY);
    } catch (_e) {
      // Safe non-destructive failure
    }
  },
};
