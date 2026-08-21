/**
 * Authentication Service
 *
 * Handles login, registration, password hashing, and session lifecycle.
 */

import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { userRepo } from '../repositories/userRepo.js';
import { BadRequestError, UnauthorizedError, ConflictError } from '../utils/errors.js';
import { config } from '../config/index.js';
import { logger } from '../utils/logger.js';

export const authService = {
  async register(data: { email: string; password: string; name: string }) {
    const existing = await userRepo.findByEmail(data.email.toLowerCase().trim());
    if (existing) {
      throw new ConflictError('A user with this email address already exists');
    }

    const passwordHash = await bcrypt.hash(data.password, 12);
    const user = await userRepo.create({
      email: data.email.toLowerCase().trim(),
      passwordHash,
      name: data.name.trim(),
      role: 'user',
    });

    // Create server-side session
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + config.sessionMaxAgeMs);
    await userRepo.createSession(user.id, token, expiresAt);

    logger.security({
      event: 'USER_REGISTERED',
      userId: user.id,
      email: user.email,
    });

    return { user, token, expiresAt };
  },

  async login(data: { email: string; password: string }) {
    const email = data.email.toLowerCase().trim();
    const user = await userRepo.findByEmail(email);
    if (!user) {
      logger.security({
        event: 'LOGIN_FAILURE_UNKNOWN_EMAIL',
        email,
      });
      throw new UnauthorizedError('Invalid email or password');
    }

    const isMatch = await bcrypt.compare(data.password, user.passwordHash);
    if (!isMatch) {
      logger.security({
        event: 'LOGIN_FAILURE_WRONG_PASSWORD',
        userId: user.id,
        email: user.email,
      });
      throw new UnauthorizedError('Invalid email or password');
    }

    // Create session token
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + config.sessionMaxAgeMs);
    await userRepo.createSession(user.id, token, expiresAt);

    logger.security({
      event: 'LOGIN_SUCCESS',
      userId: user.id,
      email: user.email,
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      token,
      expiresAt,
    };
  },

  async logout(token: string) {
    if (token) {
      await userRepo.deleteSession(token);
    }
    return { success: true };
  },

  async getSession(token: string | null) {
    if (!token) {
      return { authenticated: false, user: null };
    }

    const session = await userRepo.findSessionByToken(token);
    if (!session || !session.user || session.expiresAt < new Date()) {
      return { authenticated: false, user: null };
    }

    return {
      authenticated: true,
      user: {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name,
        role: session.user.role,
      },
    };
  },
};
