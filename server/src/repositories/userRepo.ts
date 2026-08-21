/**
 * User Repository
 */

import { prisma } from '../db.js';
import type { UserRole } from '@prisma/client';

export const userRepo = {
  async findByEmail(email: string) {
    return prisma.user.findUnique({ where: { email } });
  },

  async findById(id: string) {
    return prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    });
  },

  async create(data: { email: string; passwordHash: string; name: string; role?: UserRole }) {
    return prisma.user.create({
      data: {
        email: data.email,
        passwordHash: data.passwordHash,
        name: data.name,
        role: data.role || 'user',
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    });
  },

  async createSession(userId: string, token: string, expiresAt: Date) {
    return prisma.session.create({
      data: { userId, token, expiresAt },
    });
  },

  async findSessionByToken(token: string) {
    return prisma.session.findUnique({
      where: { token },
      include: {
        user: {
          select: { id: true, email: true, name: true, role: true },
        },
      },
    });
  },

  async deleteSession(token: string) {
    return prisma.session.deleteMany({ where: { token } });
  },

  async deleteExpiredSessions() {
    return prisma.session.deleteMany({
      where: { expiresAt: { lt: new Date() } },
    });
  },
};
