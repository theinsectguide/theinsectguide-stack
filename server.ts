import express, { Request, Response } from 'express';
import cors from 'cors';
import path from 'path';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';

dotenv.config();

import {
  initDB,
  findUserByEmail,
  findUserById,
  createUser,
  updateUser,
  deleteUserById,
  getAllUsers,
  createScan,
  getScansByUserId,
  getScanById,
  getAllScans,
  createJournalEntry,
  getJournalEntriesByUserId,
  updateJournalEntry,
  deleteJournalEntry,
  getAlertsForUser,
  markAlertAsRead,
  savePushSubscription,
  createAlert,
  getAllTransactions,
  getTransactionsByUserId,
} from './server/db';
import {
  generateToken,
  hashPassword,
  comparePassword,
  requireAuth,
  requirePro,
  requireAdmin,
  optionalAuth,
  seedAdminUser,
  seedDemoUser,
  seedProtectedUsers,
  checkLoginAttempts,
  recordFailedLoginAttempt,
  recordSuccessfulLogin,
  AuthRequest,
} from './server/auth';
import { identifyInsectWithClaude, analyzePestWithClaude } from './server/anthropic';
import {
  sendWelcomeEmail,
  addOrUpdateBrevoContact,
  sendWeeklySeasonalAlertEmail,
  REGIONAL_WEEKLY_ALERTS,
} from './server/email';
import { fetchRegionalInsectRisk } from './server/weather';
import { ENCYCLOPEDIA_SPECIES, TOP_TEN_BY_COUNTRY } from './server/encyclopediaData';
import {
  getPayPalConfig,
  handleCreatePayPalOrder,
  handleCapturePayPalOrder,
  handleCancelSubscription,
  handleRequestRefund,
  handlePayPalWebhook,
} from './server/paypal';
import { UserDoc } from './server/types';

const app = express();
const PORT = 3000;

// Body Parsers & Middlewares
app.use(cors());
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// Healthcheck
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// ----------------------------------------------------
// AUTHENTICATION ROUTES & HELPERS
// ----------------------------------------------------
async function getUserProfileWithStats(user: UserDoc) {
  const userScans = await getScansByUserId(user._id);
  const userJournals = await getJournalEntriesByUserId(user._id);
  const uniqueSpecies = new Set(
    userJournals.map(j => (j.insect_name || j.scan_result?.common_name || '').trim().toLowerCase()).filter(Boolean)
  );

  return {
    id: user._id,
    email: user.email,
    name: user.name,
    region: user.region,
    level: user.level,
    tier: user.tier,
    role: user.role,
    subscription_status: user.subscription_status,
    subscription_plan: user.subscription_plan,
    subscription_start: user.subscription_start,
    last_payment_date: user.last_payment_date,
    scans_count: userScans.length,
    species_found: uniqueSpecies.size,
    refund_requested: user.refund_requested,
  };
}

app.post('/api/auth/register', async (req: Request, res: Response) => {
  try {
    const { name, email, password, region, level } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const existing = await findUserByEmail(email);
    if (existing) {
      return res.status(400).json({ error: 'An account with this email already exists.' });
    }

    const hashedPassword = await hashPassword(password);
    const validRegions = ['UK', 'US', 'CA', 'AU', 'EU', 'Other'];
    const validLevels = ['Beginner', 'Amateur', 'Expert', 'Master'];

    const newUser = await createUser({
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      name: name || 'Explorer',
      region: validRegions.includes(region) ? region : 'UK',
      level: validLevels.includes(level) ? level : 'Beginner',
      tier: 'free',
      subscription_status: 'none',
      role: 'user',
      created_at: new Date().toISOString(),
      scans_count: 0,
      species_found: 0,
    });

    // Create initial welcome alert
    await createAlert({
      user_id: newUser._id,
      region: newUser.region,
      type: 'seasonal',
      title: 'Welcome to The Insect Guide',
      message: `Active insect monitoring is live for ${newUser.region}. Take a photo of any insect to start your field journal.`,
      severity: 'info',
      sent_at: new Date().toISOString(),
      read: false,
    });

    // Sync contact to Brevo List #2 and send welcome transactional email
    addOrUpdateBrevoContact(newUser).catch(err => console.warn('Brevo contact sync warning:', err));
    sendWelcomeEmail(newUser).catch(err => console.warn('Welcome email non-fatal error:', err));

    const token = generateToken(newUser);
    const profile = await getUserProfileWithStats(newUser);
    return res.status(201).json({
      token,
      user: profile,
    });
  } catch (err: any) {
    console.error('Registration error:', err);
    return res.status(500).json({ error: 'Failed to complete registration.' });
  }
});

app.post('/api/auth/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const cleanEmail = email.toLowerCase().trim();

    // Check brute-force login attempts
    const attemptCheck = checkLoginAttempts(cleanEmail);
    if (!attemptCheck.allowed) {
      return res.status(429).json({
        error: `Too many failed login attempts. Account temporarily locked for ${attemptCheck.waitMinutes || 15} minutes for security.`,
        code: 'ACCOUNT_LOCKED',
      });
    }

    const user = await findUserByEmail(cleanEmail);
    if (!user || !user.password) {
      recordFailedLoginAttempt(cleanEmail);
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const valid = await comparePassword(password, user.password);
    if (!valid) {
      recordFailedLoginAttempt(cleanEmail);
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    if (user.is_banned) {
      return res.status(403).json({ error: `Account suspended: ${user.banned_reason || 'Violation of terms of service'}. Contact support for assistance.` });
    }

    // Clear failed attempts upon successful authentication
    recordSuccessfulLogin(cleanEmail);

    const token = generateToken(user);
    const profile = await getUserProfileWithStats(user);
    return res.json({
      token,
      user: profile,
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ error: 'Internal login error.' });
  }
});

// Distinct Admin Login endpoint
app.post('/api/auth/admin-login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Admin email and password required.' });
    }

    const cleanEmail = email.toLowerCase().trim();

    // Check brute-force login attempts
    const attemptCheck = checkLoginAttempts(`admin_${cleanEmail}`);
    if (!attemptCheck.allowed) {
      return res.status(429).json({
        error: `Too many failed admin attempts. Endpoint locked for ${attemptCheck.waitMinutes || 15} minutes.`,
        code: 'ADMIN_LOCKED',
      });
    }

    const user = await findUserByEmail(cleanEmail);
    if (!user || user.role !== 'admin' || !user.password) {
      recordFailedLoginAttempt(`admin_${cleanEmail}`);
      return res.status(403).json({ error: 'Invalid administrator credentials.' });
    }

    const valid = await comparePassword(password, user.password);
    if (!valid) {
      recordFailedLoginAttempt(`admin_${cleanEmail}`);
      return res.status(403).json({ error: 'Invalid administrator credentials.' });
    }

    recordSuccessfulLogin(`admin_${cleanEmail}`);

    const token = generateToken(user);
    const profile = await getUserProfileWithStats(user);
    return res.json({
      token,
      user: profile,
    });
  } catch (err) {
    return res.status(500).json({ error: 'Admin authentication failed.' });
  }
});

app.get('/api/auth/me', requireAuth, async (req: AuthRequest, res: Response) => {
  const user = req.user!;
  const profile = await getUserProfileWithStats(user);
  return res.json({
    user: profile,
  });
});

app.put('/api/auth/update-profile', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user!;
    const { name, region, level } = req.body;

    const updates: any = {};
    if (name) updates.name = name.trim();
    if (region && ['UK', 'US', 'CA', 'AU', 'EU', 'Other'].includes(region)) updates.region = region;
    if (level && ['Beginner', 'Amateur', 'Expert', 'Master'].includes(level)) updates.level = level;

    const updated = await updateUser(user._id, updates);
    if (!updated) return res.status(404).json({ error: 'User not found.' });
    const { password: _, ...sanitized } = updated;
    return res.json({ user: sanitized });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to update profile.' });
  }
});

// ----------------------------------------------------
// SCAN & CLAUDE VISION IDENTIFICATION ROUTES
// ----------------------------------------------------
app.post('/api/scans/identify', requirePro, async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user!;
    const { image, mimeType, location, notes } = req.body;

    if (!image) {
      return res.status(400).json({ error: 'Image data is required for identification.' });
    }

    // Call Claude Vision
    try {
      const scanResult = await identifyInsectWithClaude(
        image,
        mimeType || 'image/jpeg',
        user.region
      );

      // Save scan record with full provenance logging
      const scanDoc = await createScan({
        user_id: user._id,
        image_url: image.startsWith('data:') ? image : `data:${mimeType || 'image/jpeg'};base64,${image}`,
        result: scanResult,
        insect_name: scanResult.common_name,
        latin_name: scanResult.latin_name,
        identified_species: `${scanResult.common_name} (${scanResult.latin_name})`,
        danger_level: scanResult.danger_level,
        threat_index_display: scanResult.threat_index_display,
        threat_explanation: scanResult.threat_explanation,
        vision_model_used: scanResult.vision_model_used || null,
        provider_used: scanResult.provider_used || null,
        confidence: scanResult.confidence || null,
        analysis_status: scanResult.analysis_status || 'success',
        identification_status: scanResult.identification_status || null,
        fallback_used: Boolean(scanResult.fallback_used),
        fallback_reason: scanResult.fallback_reason || null,
        timestamp: new Date().toISOString(),
        location: location || undefined,
        notes: notes || undefined,
      });

      return res.json({
        success: true,
        scan: scanDoc,
      });
    } catch (identifyError: any) {
      if (identifyError.message === 'no_insect_detected') {
        return res.status(422).json({
          error: 'no_insect_detected',
          message: 'No identifiable insect, bug or arachnid was detected in this photo. Please try again with a closer, well-lit image.',
        });
      }
      throw identifyError;
    }
  } catch (err: any) {
    console.error('Scan error:', err);
    return res.status(500).json({
      error: 'Identification service temporarily unavailable. Please try again.',
      details: err.message,
    });
  }
});

app.post('/api/scans/identify-stream', requirePro, async (req: AuthRequest, res: Response) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders?.();

  const sendEvent = (data: any) => {
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  };

  try {
    const user = req.user!;
    const { image, mimeType, location, notes } = req.body;

    if (!image) {
      sendEvent({ error: 'error', message: 'Image data is required for identification.' });
      return res.end();
    }

    sendEvent({ percent: 15, text: 'Validating specimen image...' });
    sendEvent({ percent: 25, text: 'Preparing image & morphological extraction...' });

    try {
      const scanResult = await identifyInsectWithClaude(
        image,
        mimeType || 'image/jpeg',
        user.region,
        (progress) => {
          sendEvent(progress);
        }
      );

      sendEvent({ percent: 98, text: 'Preparing scan results...' });

      // Save scan record with full provenance logging
      const scanDoc = await createScan({
        user_id: user._id,
        image_url: image.startsWith('data:') ? image : `data:${mimeType || 'image/jpeg'};base64,${image}`,
        result: scanResult,
        insect_name: scanResult.common_name,
        latin_name: scanResult.latin_name,
        identified_species: `${scanResult.common_name} (${scanResult.latin_name})`,
        danger_level: scanResult.danger_level,
        threat_index_display: scanResult.threat_index_display,
        threat_explanation: scanResult.threat_explanation,
        vision_model_used: scanResult.vision_model_used || null,
        provider_used: scanResult.provider_used || null,
        confidence: scanResult.confidence || null,
        analysis_status: scanResult.analysis_status || 'success',
        identification_status: scanResult.identification_status || null,
        fallback_used: Boolean(scanResult.fallback_used),
        fallback_reason: scanResult.fallback_reason || null,
        timestamp: new Date().toISOString(),
        location: location || undefined,
        notes: notes || undefined,
      });

      sendEvent({
        percent: 100,
        text: 'Analysis complete!',
        success: true,
        scan: scanDoc,
      });
      return res.end();
    } catch (identifyError: any) {
      if (identifyError.message === 'no_insect_detected') {
        sendEvent({
          error: 'no_insect_detected',
          message: 'No identifiable insect, bug or arachnid was detected in this photo. Please try again with a closer, well-lit image.',
        });
        return res.end();
      }
      throw identifyError;
    }
  } catch (err: any) {
    console.error('Scan stream error:', err);
    sendEvent({
      error: 'error',
      message: 'Identification service temporarily unavailable. Please try again.',
      details: err.message,
    });
    return res.end();
  }
});

app.post('/api/scans/analyze-pest', requirePro, async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user!;
    const { image, mimeType, location_found, damage_observed } = req.body;

    if (!image) {
      return res.status(400).json({ error: 'Image data is required for pest diagnosis.' });
    }

    const pestResult = await analyzePestWithClaude(image, mimeType || 'image/jpeg', {
      location_found,
      damage_observed,
    });

    const scanDoc = await createScan({
      user_id: user._id,
      image_url: image.startsWith('data:') ? image : `data:${mimeType || 'image/jpeg'};base64,${image}`,
      result: pestResult,
      insect_name: pestResult.common_name,
      latin_name: pestResult.latin_name,
      identified_species: `${pestResult.common_name} (${pestResult.latin_name})`,
      danger_level: pestResult.danger_level,
      threat_index_display: pestResult.threat_index_display,
      threat_explanation: pestResult.threat_explanation,
      vision_model_used: pestResult.vision_model_used || null,
      provider_used: pestResult.provider_used || null,
      confidence: pestResult.confidence || null,
      analysis_status: pestResult.analysis_status || 'success',
      identification_status: pestResult.identification_status || null,
      fallback_used: Boolean(pestResult.fallback_used),
      fallback_reason: pestResult.fallback_reason || null,
      timestamp: new Date().toISOString(),
      notes: `Pest Inspection - Found in: ${location_found || 'Structure'}. Signs: ${damage_observed || 'N/A'}`,
    });

    return res.json({
      success: true,
      scan: scanDoc,
    });
  } catch (err: any) {
    console.error('Pest analysis error:', err);
    return res.status(500).json({ error: 'Pest identification failed.' });
  }
});

app.get('/api/scans', requirePro, async (req: AuthRequest, res: Response) => {
  try {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    const user = req.user!;
    const scans = await getScansByUserId(user._id);
    return res.json({ scans });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to retrieve scan history.' });
  }
});

app.get('/api/scans/:id', requirePro, async (req: AuthRequest, res: Response) => {
  try {
    const scan = await getScanById(req.params.id);
    if (!scan) return res.status(404).json({ error: 'Scan not found.' });
    // Privacy isolation: users can only see their own scans unless admin
    if (scan.user_id !== req.user!._id && req.user!.role !== 'admin') {
      return res.status(403).json({ error: 'Access forbidden.' });
    }
    return res.json({ scan });
  } catch (err) {
    return res.status(500).json({ error: 'Error retrieving scan.' });
  }
});

app.post('/api/scans/:id/save-to-journal', requirePro, async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user!;
    const scan = await getScanById(req.params.id);
    const { status, notes, location, scan_result, photo_url, insect_name, latin_name, danger_level, status_type } = req.body;

    const finalScanResult = scan_result || scan?.result;
    const finalPhoto = photo_url || scan?.image_url;
    const finalName = insect_name || scan?.insect_name || finalScanResult?.common_name || 'Specimen';
    const finalLatin = latin_name || scan?.latin_name || finalScanResult?.latin_name || 'Insecta sp.';
    const finalDanger = typeof danger_level === 'number' ? danger_level : (scan?.danger_level ?? finalScanResult?.danger_level ?? 0);
    const finalStatusType = status_type || scan?.result?.status || finalScanResult?.status || 'safe';
    const finalLocation = location || scan?.location;
    const finalNotes = notes || scan?.notes || 'Saved from AI identification scan.';

    const journal = await createJournalEntry({
      user_id: user._id,
      scan_id: scan?._id || req.params.id,
      photo_url: finalPhoto,
      insect_name: finalName,
      latin_name: finalLatin,
      danger_level: finalDanger,
      status_type: finalStatusType,
      date: new Date().toISOString(),
      location: finalLocation,
      notes: finalNotes,
      status: ['found', 'observed', 'reported', 'photographed'].includes(status) ? status : 'found',
      scan_result: finalScanResult,
    });

    return res.json({ success: true, entry: journal });
  } catch (err: any) {
    console.error('Failed to save to journal:', err);
    return res.status(500).json({ error: 'Failed to save to journal.' });
  }
});

// ----------------------------------------------------
// OBSERVATION JOURNAL ROUTES
// ----------------------------------------------------
app.get('/api/journal', requirePro, async (req: AuthRequest, res: Response) => {
  try {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    const entries = await getJournalEntriesByUserId(req.user!._id);
    const enriched = await Promise.all(
      entries.map(async (entry) => {
        if (!entry.scan_result && entry.scan_id) {
          const scan = await getScanById(entry.scan_id);
          if (scan?.result) {
            return { ...entry, scan_result: scan.result };
          }
        }
        return entry;
      })
    );
    return res.json({ entries: enriched });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to retrieve journal entries.' });
  }
});

app.post('/api/journal', requirePro, async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user!;
    const { photo_url, insect_name, latin_name, danger_level, status_type, location, notes, status, scan_result } = req.body;

    if (!insect_name || !photo_url) {
      return res.status(400).json({ error: 'Insect name and photo are required.' });
    }

    const entry = await createJournalEntry({
      user_id: user._id,
      photo_url,
      insect_name,
      latin_name: latin_name || 'Insecta sp.',
      danger_level: typeof danger_level === 'number' ? danger_level : 0,
      status_type: status_type || 'safe',
      date: new Date().toISOString(),
      location,
      notes,
      status: status || 'found',
      scan_result,
    });

    return res.status(201).json({ success: true, entry });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to add journal entry.' });
  }
});

app.put('/api/journal/:id', requirePro, async (req: AuthRequest, res: Response) => {
  try {
    const entries = await getJournalEntriesByUserId(req.user!._id);
    const exists = entries.find(e => e._id === req.params.id);
    if (!exists) return res.status(404).json({ error: 'Entry not found or unauthorized.' });

    const updated = await updateJournalEntry(req.params.id, req.body);
    return res.json({ success: true, entry: updated });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to update entry.' });
  }
});

app.delete('/api/journal/:id', requirePro, async (req: AuthRequest, res: Response) => {
  try {
    const entries = await getJournalEntriesByUserId(req.user!._id);
    const exists = entries.find(e => e._id === req.params.id);
    if (!exists && req.user!.role !== 'admin') {
      return res.status(404).json({ error: 'Entry not found or unauthorized.' });
    }

    await deleteJournalEntry(req.params.id);
    return res.json({ success: true, message: 'Journal entry removed.' });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to delete journal entry.' });
  }
});

// ----------------------------------------------------
// ENCYCLOPEDIA & SPECIES ROUTES
// ----------------------------------------------------
app.get('/api/encyclopedia', (req: Request, res: Response) => {
  const { region, category, search, season } = req.query;

  let results = [...ENCYCLOPEDIA_SPECIES];

  if (region && typeof region === 'string' && region !== 'ALL') {
    results = results.filter(s => s.regions.includes(region as any) || s.regions.includes('Other'));
  }
  if (category && typeof category === 'string' && category !== 'ALL') {
    results = results.filter(s => s.category.toLowerCase() === category.toLowerCase());
  }
  if (season && typeof season === 'string' && season !== 'ALL') {
    results = results.filter(s => s.active_seasons.map(x => x.toLowerCase()).includes(season.toLowerCase()));
  }
  if (search && typeof search === 'string') {
    const q = search.toLowerCase();
    results = results.filter(
      s =>
        s.common_name.toLowerCase().includes(q) ||
        s.latin_name.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q) ||
        s.habitat.toLowerCase().includes(q)
    );
  }

  return res.json({ species: results, total: results.length });
});

app.get('/api/encyclopedia/top-ten', (req: Request, res: Response) => {
  const region = (req.query.region as string) || 'UK';
  const data = TOP_TEN_BY_COUNTRY[region] || TOP_TEN_BY_COUNTRY['UK'];
  return res.json({ region, top_ten: data });
});

app.get('/api/encyclopedia/:id', (req: Request, res: Response) => {
  const item = ENCYCLOPEDIA_SPECIES.find(s => s.id === req.params.id);
  if (!item) return res.status(404).json({ error: 'Species not found.' });
  return res.json({ species: item });
});

// ----------------------------------------------------
// FIRST AID & MEDICAL TRIAGE GUIDANCE
// ----------------------------------------------------
app.post('/api/firstaid/evaluate', (req: Request, res: Response) => {
  try {
    const {
      body_part,
      pain_level, // 1-10
      swelling, // boolean
      redness, // boolean
      itching, // boolean
      difficulty_breathing, // boolean - CRITICAL RED FLAG
      nausea, // boolean
      dizziness, // boolean - CRITICAL
      spreading_rash, // boolean
      fever, // boolean
      duration_hours,
      victim_age,
      known_allergies,
      region,
    } = req.body;

    const emergencyNumbers: Record<string, string> = {
      UK: '999',
      US: '911',
      CA: '911',
      AU: '000',
      EU: '112',
      Other: '112 / 911',
    };

    const localEmergency = emergencyNumbers[region] || '911 / 999 / 112';

    // Medical triage categorization
    let triage_level: 'surveillance' | 'consult_doctor' | 'immediate_emergency' = 'surveillance';
    const warning_signals: string[] = [];
    const recommended_actions: string[] = [];

    // Red flag anaphylaxis checks
    if (difficulty_breathing || dizziness || (swelling && ['neck', 'throat', 'mouth', 'tongue'].includes((body_part || '').toLowerCase()))) {
      triage_level = 'immediate_emergency';
      warning_signals.push('Potential systemic anaphylaxis or airway obstruction detected.');
      warning_signals.push(`Call local emergency medical services IMMEDIATELY.`);
      recommended_actions.push(`1. Call emergency services immediately or administer EpiPen if prescribed.`);
      recommended_actions.push('2. Lay flat with legs elevated unless breathing is easier sitting up.');
      recommended_actions.push('3. Do not stand or walk abruptly.');
    } else if (fever || spreading_rash || nausea || Number(pain_level) >= 8 || Number(victim_age) < 3) {
      triage_level = 'consult_doctor';
      warning_signals.push('High-intensity systemic symptoms or infant vulnerability present.');
      recommended_actions.push('1. Contact a healthcare provider, Urgent Care, or NHS 111 promptly.');
      recommended_actions.push('2. Wash bite/sting site thoroughly with mild antiseptic soap.');
      recommended_actions.push('3. Apply a cold ice pack wrapped in a towel for 15-minute intervals.');
      recommended_actions.push('4. Mark the border of redness with a clean pen to monitor spreading infection.');
    } else {
      triage_level = 'surveillance';
      recommended_actions.push('1. Clean wound thoroughly with soap and cool water.');
      recommended_actions.push('2. Apply cold compress to reduce local edema and discomfort.');
      recommended_actions.push('3. Take over-the-counter antihistamine (e.g. Cetirizine) and paracetamol/ibuprofen if appropriate.');
      recommended_actions.push('4. Monitor closely for the next 24-48 hours for secondary infection or delayed allergic signs.');
    }

    return res.json({
      triage_level,
      emergency_number: localEmergency,
      warning_signals,
      recommended_actions,
      disclaimer: 'FOR EDUCATIONAL PURPOSES ONLY. This triage tool is not a medical diagnosis. Always consult a licensed healthcare professional or emergency medical provider for bite and sting management.',
    });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to process first aid evaluation.' });
  }
});

// ----------------------------------------------------
// REGIONAL WEATHER & INSECT HAZARD ALERTS
// ----------------------------------------------------
app.get('/api/weather/risk', async (req: Request, res: Response) => {
  const region = (req.query.region as string) || 'UK';
  const risk = await fetchRegionalInsectRisk(region);
  return res.json({ risk });
});

app.get('/api/alerts', optionalAuth, async (req: AuthRequest, res: Response) => {
  const userId = req.user?._id || 'guest';
  const region = req.user?.region || (req.query.region as string) || 'UK';
  const alerts = await getAlertsForUser(userId, region);
  return res.json({ alerts });
});

app.post('/api/alerts/:id/read', requireAuth, async (req: AuthRequest, res: Response) => {
  await markAlertAsRead(req.params.id);
  return res.json({ success: true });
});

app.post('/api/alerts/push-subscribe', requireAuth, async (req: AuthRequest, res: Response) => {
  const user = req.user!;
  const { subscription } = req.body;
  if (subscription) {
    await savePushSubscription(user._id, subscription);
  }
  return res.json({ success: true });
});

// ----------------------------------------------------
// PAYPAL REST ORDER, CAPTURE, WEBHOOKS & BILLING ROUTES
// ----------------------------------------------------
app.get('/api/paypal/config', getPayPalConfig);
app.post('/api/paypal/create-order', requireAuth, handleCreatePayPalOrder);
app.post('/api/paypal/capture-order', requireAuth, handleCapturePayPalOrder);
app.post('/api/subscription/cancel', requireAuth, handleCancelSubscription);
app.post('/api/subscription/refund', requireAuth, handleRequestRefund);
app.get('/api/subscription/transactions', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const transactions = await getTransactionsByUserId(req.user!._id);
    return res.json({ transactions });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to retrieve transactions.' });
  }
});
app.post('/api/webhooks/paypal', handlePayPalWebhook);

// ----------------------------------------------------
// ADMIN DASHBOARD & MANAGEMENT (STRICT ISOLATION)
// ----------------------------------------------------
app.get('/api/admin/stats', requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const allUsers = await getAllUsers();
    const allScans = await getAllScans();

    const proUsers = allUsers.filter(u => u.tier === 'pro' && u.subscription_status === 'active');
    const cancelledUsers = allUsers.filter(u => u.subscription_status === 'cancelled');
    const refundedUsers = allUsers.filter(u => u.subscription_status === 'refunded' || u.refund_requested);

    // Calculate MRR / ARR in USD
    let mrr = 0;
    proUsers.forEach(u => {
      if (u.subscription_plan === 'annual') {
        mrr += 29.99 / 12;
      } else {
        mrr += 4.99;
      }
    });
    const arr = mrr * 12;

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const weekStart = todayStart - 7 * 24 * 60 * 60 * 1000;

    const newUsersToday = allUsers.filter(u => new Date(u.created_at).getTime() >= todayStart).length;
    const newUsersThisWeek = allUsers.filter(u => new Date(u.created_at).getTime() >= weekStart).length;

    // Scan stats & Top 10 scanned insects
    const insectFrequency: Record<string, number> = {};
    let totalDanger = 0;

    allScans.forEach(s => {
      const name = s.insect_name || s.result?.common_name || 'Unknown Specimen';
      insectFrequency[name] = (insectFrequency[name] || 0) + 1;
      totalDanger += s.danger_level || s.result?.danger_level || 0;
    });

    // Default top specimens if empty
    if (Object.keys(insectFrequency).length === 0) {
      insectFrequency['Yellowjacket Wasp'] = 14;
      insectFrequency['European Hornet'] = 11;
      insectFrequency['Noble False Widow'] = 9;
      insectFrequency['Brown Recluse'] = 8;
      insectFrequency['Black Widow Spider'] = 7;
      insectFrequency['Deer Tick'] = 6;
      insectFrequency['Bed Bug'] = 5;
      insectFrequency['Carpet Beetle'] = 4;
      insectFrequency['German Cockroach'] = 4;
      insectFrequency['Silverfish'] = 3;
    }

    const topScannedInsects = Object.entries(insectFrequency)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Region distribution (UK / US / CA / AU / EU / Other)
    const regionFrequency: Record<string, number> = {
      UK: 0,
      US: 0,
      CA: 0,
      AU: 0,
      EU: 0,
      Other: 0,
    };

    allUsers.forEach(u => {
      const reg = (u.region || 'Other').toUpperCase();
      if (regionFrequency[reg] !== undefined) {
        regionFrequency[reg] += 1;
      } else {
        regionFrequency['Other'] += 1;
      }
    });

    const averageDanger = allScans.length > 0 ? (totalDanger / allScans.length).toFixed(1) : '4.8';

    const statsPayload = {
      mrr: Number(mrr.toFixed(2)),
      arr: Number(arr.toFixed(2)),
      total_users: allUsers.length,
      pro_users: proUsers.length,
      cancelled_users: cancelledUsers.length,
      refunded_users: refundedUsers.length,
      new_users_today: newUsersToday,
      new_users_week: newUsersThisWeek,
      total_scans: allScans.length,
      top_scanned_insects: topScannedInsects,
      most_active_regions: regionFrequency,
      average_danger_level: Number(averageDanger),
    };

    return res.json({
      success: true,
      stats: statsPayload,
    });
  } catch (err) {
    console.error('Admin stats error:', err);
    return res.status(500).json({ error: 'Failed to generate admin statistics.' });
  }
});

app.get('/api/admin/users', requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const users = await getAllUsers();
    const sanitized = users.map(u => ({
      id: u._id,
      email: u.email,
      name: u.name,
      role: u.role,
      tier: u.tier,
      region: u.region,
      level: u.level,
      subscription_status: u.subscription_status,
      subscription_plan: u.subscription_plan,
      subscription_start: u.subscription_start,
      created_at: u.created_at,
      scans_count: u.scans_count || 0,
      species_found: u.species_found || 0,
      is_banned: !!u.is_banned,
      banned_reason: u.banned_reason,
      banned_at: u.banned_at,
    }));
    return res.json({ users: sanitized });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to retrieve users.' });
  }
});

app.post('/api/admin/users/:id/ban', requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const target = await findUserById(req.params.id);
    if (!target) return res.status(404).json({ error: 'User not found.' });
    if (target.email === req.user!.email || target.role === 'admin') {
      return res.status(400).json({ error: 'Administrators cannot be banned.' });
    }

    const { reason } = req.body;
    const updated = await updateUser(req.params.id, {
      is_banned: true,
      banned_reason: reason || 'Administrative suspension',
      banned_at: new Date().toISOString(),
    });

    return res.json({ success: true, message: `User ${target.email} has been banned.`, user: updated });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to ban user.' });
  }
});

app.post('/api/admin/users/:id/unban', requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const target = await findUserById(req.params.id);
    if (!target) return res.status(404).json({ error: 'User not found.' });

    const updated = await updateUser(req.params.id, {
      is_banned: false,
      banned_reason: undefined,
      banned_at: undefined,
    });

    return res.json({ success: true, message: `User ${target.email} has been unbanned.`, user: updated });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to unban user.' });
  }
});

app.delete('/api/admin/users/:id', requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const target = await findUserById(req.params.id);
    if (!target) return res.status(404).json({ error: 'User not found.' });
    if (target.email === req.user!.email) {
      return res.status(400).json({ error: 'Administrators cannot delete their own primary account.' });
    }

    await deleteUserById(req.params.id);
    return res.json({ success: true, message: `User ${target.email} and all associated scans deleted.` });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to delete user.' });
  }
});

// Admin get verified transactions list
app.get('/api/admin/transactions', requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const transactions = await getAllTransactions();
    return res.json({ transactions });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to retrieve transactions.' });
  }
});

// Admin manual trigger for weekly seasonal alerts
app.post('/api/admin/trigger-weekly-alerts', requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const result = await dispatchWeeklySeasonalAlerts();
    return res.json({ success: true, ...result });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to dispatch weekly seasonal alerts.' });
  }
});

/**
 * Dispatches weekly regional seasonal alert emails to all eligible active users
 */
async function dispatchWeeklySeasonalAlerts(): Promise<{ processed: number; sent: number }> {
  console.log('[Weekly Seasonal Alert] Starting dispatch cycle...');
  const users = await getAllUsers();
  let sent = 0;
  let processed = 0;

  for (const user of users) {
    // Skip admin accounts and banned users
    if (user.role === 'admin' || user.is_banned) continue;
    processed++;

    const region = user.region || 'UK';
    const alertData = REGIONAL_WEEKLY_ALERTS[region] || REGIONAL_WEEKLY_ALERTS['Other'];

    try {
      await sendWeeklySeasonalAlertEmail(
        { email: user.email, name: user.name },
        region,
        alertData.text,
        alertData.species
      );
      sent++;
    } catch (err) {
      console.warn(`[Weekly Alert] Error sending alert to ${user.email}:`, err);
    }
  }

  console.log(`[Weekly Seasonal Alert] Completed cycle: ${sent}/${processed} emails dispatched.`);
  return { processed, sent };
}

/**
 * Automated Cron Check: Every Monday at 08:00 UTC
 */
let lastDispatchedWeekKey = '';

function startWeeklyAlertScheduler() {
  setInterval(async () => {
    const now = new Date();
    const utcDay = now.getUTCDay(); // 0 = Sunday, 1 = Monday
    const utcHour = now.getUTCHours(); // 0-23
    const utcMinute = now.getUTCMinutes(); // 0-59

    // Generate unique key for current year + week number to avoid re-triggering
    const startOfYear = new Date(Date.UTC(now.getUTCFullYear(), 0, 1));
    const weekNumber = Math.ceil((((now.getTime() - startOfYear.getTime()) / 86400000) + startOfYear.getUTCDay() + 1) / 7);
    const currentWeekKey = `${now.getUTCFullYear()}-W${weekNumber}`;

    // Target: Monday (1) between 08:00 and 08:05 UTC
    if (utcDay === 1 && utcHour === 8 && utcMinute <= 5) {
      if (lastDispatchedWeekKey !== currentWeekKey) {
        lastDispatchedWeekKey = currentWeekKey;
        console.log(`[Weekly Scheduler] Triggering automated Monday 08:00 UTC dispatch for ${currentWeekKey}`);
        try {
          await dispatchWeeklySeasonalAlerts();
        } catch (err) {
          console.error('[Weekly Scheduler] Dispatch error:', err);
        }
      }
    }
  }, 60000); // Check every 60 seconds
}

// ----------------------------------------------------
// START SERVER & VITE INTEGRATION
// ----------------------------------------------------
async function start() {
  await initDB();
  await seedAdminUser();
  await seedDemoUser();
  await seedProtectedUsers();
  startWeeklyAlertScheduler();

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true, host: '0.0.0.0', port: PORT },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`The Insect Guide server running on http://0.0.0.0:${PORT}`);
  });
}

start();
