/**
 * Bookmark Business Service
 *
 * Implements strict IDOR protection. User ID is derived exclusively
 * from the authenticated session.
 */

import { bookmarkRepo } from '../repositories/bookmarkRepo.js';
import { NotFoundError, ForbiddenError } from '../utils/errors.js';
import { prisma } from '../db.js';
import type { BookmarkType } from '@prisma/client';

export const bookmarkService = {
  async getBookmarks(userId: string) {
    return bookmarkRepo.findByUser(userId);
  },

  async toggleBookmark(userId: string, type: BookmarkType, itemId: string) {
    return bookmarkRepo.toggle(userId, type, itemId);
  },

  async deleteBookmark(userId: string, bookmarkId: string) {
    const bookmark = await prisma.bookmark.findUnique({
      where: { id: bookmarkId },
    });

    if (!bookmark) {
      throw new NotFoundError(`Bookmark with ID "${bookmarkId}" not found`);
    }

    // IDOR Protection: User B attempting to delete User A's bookmark
    if (bookmark.userId !== userId) {
      throw new ForbiddenError('Forbidden: you do not own this bookmark');
    }

    await prisma.bookmark.delete({ where: { id: bookmarkId } });
    return { success: true };
  },
};
