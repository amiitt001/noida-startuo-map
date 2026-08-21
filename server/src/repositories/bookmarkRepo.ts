/**
 * Bookmark Repository
 */

import { prisma } from '../db.js';
import type { BookmarkType } from '@prisma/client';

export const bookmarkRepo = {
  async findByUser(userId: string) {
    return prisma.bookmark.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  },

  async isSaved(userId: string, type: BookmarkType, itemId: string): Promise<boolean> {
    const existing = await prisma.bookmark.findUnique({
      where: { userId_type_itemId: { userId, type, itemId } },
    });
    return !!existing;
  },

  async toggle(
    userId: string,
    type: BookmarkType,
    itemId: string
  ): Promise<{ isNowSaved: boolean }> {
    const existing = await prisma.bookmark.findUnique({
      where: { userId_type_itemId: { userId, type, itemId } },
    });

    if (existing) {
      await prisma.bookmark.delete({ where: { id: existing.id } });
      return { isNowSaved: false };
    }

    // Set startupId FK if bookmarking a startup
    const startupId = type === 'startup' ? itemId : undefined;

    await prisma.bookmark.create({
      data: {
        type,
        itemId,
        userId,
        ...(startupId ? { startupId } : {}),
      },
    });

    return { isNowSaved: true };
  },

  async count(userId: string, type?: BookmarkType): Promise<number> {
    return prisma.bookmark.count({
      where: {
        userId,
        ...(type ? { type } : {}),
      },
    });
  },
};
