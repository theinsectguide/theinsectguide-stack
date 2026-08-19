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

export async function requirePro(req: AuthRequest, res: Response, next: NextFunction) {
  return requireAuth(req, res, () => {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ error: 'Authentication required. Please log in.' });
    }
    if (user.tier !== 'pro' && user.role !== 'admin') {
      return res.status(403).json({
        error: 'Pro subscription required.',
        code: 'PRO_REQUIRED',
        message: 'This capability requires an active Pro subscription. Please select a plan to continue.',
      });
    }
    next();
  });
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

// ----------------------------------------------------
// BRUTE-FORCE RATE LIMITING FOR LOGIN ENDPOINTS
// ----------------------------------------------------
interface LoginAttemptRecord {
  count: number;
  lockedUntil?: number;
  lastAttempt: number;
}

const loginAttempts = new Map<string, LoginAttemptRecord>();

export function checkLoginAttempts(identifier: string): { allowed: boolean; waitMinutes?: number } {
  const cleanId = (identifier || '').toLowerCase().trim();
  const record = loginAttempts.get(cleanId);
  if (!record) return { allowed: true };

  const now = Date.now();
  if (record.lockedUntil && now < record.lockedUntil) {
    const waitMinutes = Math.ceil((record.lockedUntil - now) / (60 * 1000));
    return { allowed: false, waitMinutes };
  }

  // Reset attempt count if cool-off period has passed (15 mins)
  if (now - record.lastAttempt > 15 * 60 * 1000) {
    loginAttempts.delete(cleanId);
    return { allowed: true };
  }

  return { allowed: true };
}

export function recordFailedLoginAttempt(identifier: string) {
  const cleanId = (identifier || '').toLowerCase().trim();
  const now = Date.now();
  const record = loginAttempts.get(cleanId) || { count: 0, lastAttempt: now };
  record.count += 1;
  record.lastAttempt = now;

  // After 5 failed attempts, trigger a 15-minute temporary lockout
  if (record.count >= 5) {
    record.lockedUntil = now + 15 * 60 * 1000;
  }

  loginAttempts.set(cleanId, record);
}

export function recordSuccessfulLogin(identifier: string) {
  const cleanId = (identifier || '').toLowerCase().trim();
  loginAttempts.delete(cleanId);
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

export async function seedDemoUser() {
  const demoEmail = 'demo@theinsectguide.com'.toLowerCase();
  const demoPassword = 'Theinsectguide_demo';

  const existing = await findUserByEmail(demoEmail);
  const hashedPassword = await hashPassword(demoPassword);

  if (!existing) {
    await createUser({
      email: demoEmail,
      password: hashedPassword,
      name: 'Demo Entomologist',
      region: 'UK',
      level: 'Expert',
      tier: 'pro',
      subscription_status: 'active',
      subscription_plan: 'annual',
      role: 'user', // strictly regular user, NOT admin
      created_at: new Date().toISOString(),
      last_payment_date: new Date().toISOString(),
      scans_count: 0,
      species_found: 0,
    });
    console.log(`[Seed] Demo Pro user initialized: ${demoEmail}`);
  } else {
    // Ensure credentials and Pro tier are always synchronized
    await updateUser(existing._id, {
      password: hashedPassword,
      tier: 'pro',
      subscription_status: 'active',
      subscription_plan: 'annual',
      role: 'user', // ensure NOT admin
    });
    console.log(`[Seed] Demo Pro user updated/verified: ${demoEmail}`);
  }
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
      scans_count: 0,
      species_found: 0,
    });
    console.log(`Admin account initialized for: ${adminEmail}`);
  } else if (existing.role !== 'admin') {
    await updateUser(existing._id, { role: 'admin' });
  }
}

export async function seedProtectedUsers() {
  const defaultPassword = await hashPassword('Test1234');

  // 1. Jean-Marc Michiels (Paid Pro User)
  const jmEmail = 'jmmichiels1981@gmail.com';
  const jmExisting = await findUserByEmail(jmEmail);
  if (!jmExisting) {
    await createUser({
      email: jmEmail,
      password: defaultPassword,
      name: 'Jean-Marc Michiels',
      region: 'EU',
      level: 'Master',
      tier: 'pro',
      subscription_status: 'active',
      subscription_plan: 'annual',
      role: 'user',
      created_at: new Date().toISOString(),
      last_payment_date: new Date().toISOString(),
      subscription_start: new Date().toISOString(),
      scans_count: 0,
      species_found: 0,
    });
    console.log(`[Seed] Protected user initialized as Pro: ${jmEmail}`);
  } else {
    await updateUser(jmExisting._id, {
      password: defaultPassword,
      tier: 'pro',
      subscription_status: 'active',
      subscription_plan: 'annual',
    });
  }

  // 2. Vita Rosa (Free Tier account for payment testing)
  const vitaEmail = 'vitarosa2013@gmail.com';
  const vitaExisting = await findUserByEmail(vitaEmail);
  if (!vitaExisting) {
    await createUser({
      email: vitaEmail,
      password: defaultPassword,
      name: 'Vita Rosa',
      region: 'EU',
      level: 'Expert',
      tier: 'free',
      subscription_status: 'inactive',
      role: 'user',
      created_at: new Date().toISOString(),
      scans_count: 0,
      species_found: 0,
    });
    console.log(`[Seed] Protected user initialized as Free (ready for checkout testing): ${vitaEmail}`);
  } else {
    await updateUser(vitaExisting._id, {
      password: defaultPassword,
      tier: 'free',
      subscription_status: 'inactive',
      subscription_plan: undefined,
      last_payment_date: undefined,
    });
    console.log(`[Seed] User ${vitaEmail} set to Free tier for payment testing`);
  }
}
