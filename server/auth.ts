import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { findUserById, findUserByEmail, createUser, updateUser } from './db';
import { UserDoc } from './types';

const JWT_SECRET = process.env.JWT_SECRET || 'insect-guide-super-secret-jwt-key-2026';

export interface AuthRequest extends Request {
  user?: UserDoc;
}

export function generateToken(user: UserDoc): string {
  return jwt.sign(
    {
      id: user._id,
      email: user.email,
      role: user.role,
      tier: user.tier,
    },
    JWT_SECRET,
    { expiresIn: '30d' }
  );
}

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 10);
}

export async function comparePassword(plain: string, hashed: string): Promise<boolean> {
  return bcrypt.compare(plain, hashed);
}

export async function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authentication required. Please log in.' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; email: string; role: string };

    const user = await findUserById(decoded.id);
    if (!user) {
      return res.status(401).json({ error: 'User account not found.' });
    }

    if (user.is_banned) {
      return res.status(403).json({ error: `Account suspended: ${user.banned_reason || 'Violation of terms of service'}. Contact support for assistance.` });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired session token.' });
  }
}

export async function requireAdmin(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Admin authentication required.' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; role: string };

    const user = await findUserById(decoded.id);
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied. Administrator privileges required.' });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(403).json({ error: 'Unauthorized admin access.' });
  }
}

export async function optionalAuth(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, JWT_SECRET) as { id: string };
      const user = await findUserById(decoded.id);
      if (user) req.user = user;
    }
  } catch {
    // optional, do not block
  }
  next();
}

export async function seedAdminUser() {
  const adminEmail = (process.env.ADMIN_EMAIL || 'admin@theinsectguide.com').toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD || 'AdminSecure2026!';

  const existing = await findUserByEmail(adminEmail);
  if (!existing) {
    const hashedPassword = await hashPassword(adminPassword);
    await createUser({
      email: adminEmail,
      password: hashedPassword,
      name: 'Head Entomologist & Admin',
      region: 'UK',
      level: 'Master',
      tier: 'pro',
      subscription_status: 'active',
      role: 'admin',
      created_at: new Date().toISOString(),
      scans_count: 350,
      species_found: 120,
    });
    console.log(`Admin account initialized for: ${adminEmail}`);
  } else if (existing.role !== 'admin') {
    await updateUser(existing._id, { role: 'admin' });
  }
}
