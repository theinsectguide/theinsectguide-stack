import { MongoClient, Db, ObjectId } from 'mongodb';
import { UserDoc, ScanDoc, JournalEntryDoc, AlertDoc, SpeciesEntry, TransactionDoc } from './types';
import fs from 'fs';
import path from 'path';

let client: MongoClient | null = null;
let mongoDb: Db | null = null;
let isConnectedToMongo = false;

// Fallback in-memory/file storage when MongoDB URI is not active
const memoryStore = {
  users: new Map<string, UserDoc>(),
  scans: new Map<string, ScanDoc>(),
  journal_entries: new Map<string, JournalEntryDoc>(),
  alerts: new Map<string, AlertDoc>(),
  transactions: new Map<string, TransactionDoc>(),
  push_subscriptions: new Map<string, any>(),
};

// Strict durable disk persistence files with triple-redundancy
const PRIMARY_DATA_FILE = path.join(process.cwd(), 'database_store.json');
const BACKUP_DATA_FILE = path.join(process.cwd(), 'database_store.backup.json');
const LEGACY_DATA_FILE = path.join(process.cwd(), '.data_store.json');

function loadLocalStore() {
  try {
    const filesToTry = [PRIMARY_DATA_FILE, BACKUP_DATA_FILE, LEGACY_DATA_FILE];
    for (const filePath of filesToTry) {
      if (fs.existsSync(filePath)) {
        try {
          const raw = fs.readFileSync(filePath, 'utf-8');
          if (raw && raw.trim().length > 0) {
            const data = JSON.parse(raw);
            if (data.users) Object.entries(data.users).forEach(([k, v]) => memoryStore.users.set(k, v as UserDoc));
            if (data.scans) Object.entries(data.scans).forEach(([k, v]) => memoryStore.scans.set(k, v as ScanDoc));
            if (data.journal_entries) Object.entries(data.journal_entries).forEach(([k, v]) => memoryStore.journal_entries.set(k, v as JournalEntryDoc));
            if (data.alerts) Object.entries(data.alerts).forEach(([k, v]) => memoryStore.alerts.set(k, v as AlertDoc));
            if (data.transactions) Object.entries(data.transactions).forEach(([k, v]) => memoryStore.transactions.set(k, v as TransactionDoc));
            console.log(`[Database Persistence] Protected and loaded ${memoryStore.users.size} users, ${memoryStore.scans.size} scans, ${memoryStore.journal_entries.size} journals from ${filePath}.`);
            return; // Stop after loading the primary/first valid store file so deleted records are not resurrected!
          }
        } catch (e) {
          console.warn(`[Database Persistence] Warning reading ${filePath}:`, e);
        }
      }
    }
  } catch (err) {
    console.error('[Database Persistence] Error loading store cache from disk:', err);
  }
}

export function saveLocalStore() {
  try {
    const data = {
      users: Object.fromEntries(memoryStore.users),
      scans: Object.fromEntries(memoryStore.scans),
      journal_entries: Object.fromEntries(memoryStore.journal_entries),
      alerts: Object.fromEntries(memoryStore.alerts),
      transactions: Object.fromEntries(memoryStore.transactions),
      last_persisted_at: new Date().toISOString(),
    };
    const jsonString = JSON.stringify(data, null, 2);
    // Write primary store
    fs.writeFileSync(PRIMARY_DATA_FILE, jsonString, 'utf-8');
    // Write backup store
    fs.writeFileSync(BACKUP_DATA_FILE, jsonString, 'utf-8');
    // Write legacy safety store
    fs.writeFileSync(LEGACY_DATA_FILE, jsonString, 'utf-8');
  } catch (err) {
    console.error('[Database Persistence] Error writing database_store to disk:', err);
  }
}

function isValidMongoUri(uri?: string): boolean {
  if (!uri || typeof uri !== 'string') return false;
  const trimmed = uri.trim();
  if (!trimmed.startsWith('mongodb://') && !trimmed.startsWith('mongodb+srv://')) return false;
  if (
    trimmed.includes('username:password') ||
    trimmed.includes('<username>') ||
    trimmed.includes('<password>') ||
    trimmed.includes('your-cluster') ||
    trimmed.includes('MY_MONGODB_URI') ||
    trimmed.includes('your_mongodb_connection_string')
  ) {
    return false;
  }
  return true;
}

export async function initDB() {
  loadLocalStore();
  const uri = process.env.MONGODB_URI?.trim();

  if (isValidMongoUri(uri)) {
    try {
      client = new MongoClient(uri!, {
        serverSelectionTimeoutMS: 2000,
        connectTimeoutMS: 2000,
        socketTimeoutMS: 3000,
        family: 4,
        directConnection: false,
      });

      // Suppress unhandled socket/tls events on background client pool
      client.on('error', () => {});

      await client.connect();
      mongoDb = client.db();
      isConnectedToMongo = true;
      console.log('[Database] Successfully connected to MongoDB cluster');
    } catch {
      isConnectedToMongo = false;
      if (client) {
        try {
          await client.close(true);
        } catch {
          // ignore cleanup errors
        }
        client = null;
        mongoDb = null;
      }
      console.info('[Database] Remote MongoDB unreachable. Seamlessly operating on durable local persistent store.');
    }
  } else {
    console.log('[Database] Operating in secure durable local storage mode');
  }
}

// User methods
export async function findUserByEmail(email: string): Promise<UserDoc | null> {
  const normEmail = email.toLowerCase().trim();
  if (isConnectedToMongo && mongoDb) {
    const user = await mongoDb.collection('users').findOne({ email: normEmail });
    if (user) {
      return { ...user, _id: user._id.toString() } as unknown as UserDoc;
    }
    return null;
  }
  for (const user of memoryStore.users.values()) {
    if (user.email.toLowerCase() === normEmail) return user;
  }
  return null;
}

export async function findUserById(id: string): Promise<UserDoc | null> {
  if (isConnectedToMongo && mongoDb) {
    try {
      const user = await mongoDb.collection('users').findOne({ _id: new ObjectId(id) });
      if (user) {
        return { ...user, _id: user._id.toString() } as unknown as UserDoc;
      }
    } catch {
      const user = await mongoDb.collection('users').findOne({ _id: id as any });
      if (user) return { ...user, _id: user._id.toString() } as unknown as UserDoc;
    }
    return null;
  }
  return memoryStore.users.get(id) || null;
}

export async function createUser(user: Omit<UserDoc, '_id'>): Promise<UserDoc> {
  const newId = new ObjectId().toString();
  const doc: UserDoc = {
    ...user,
    _id: newId,
    email: user.email.toLowerCase().trim(),
  };

  if (isConnectedToMongo && mongoDb) {
    await mongoDb.collection('users').insertOne({ ...doc, _id: new ObjectId(newId) as any });
  }
  memoryStore.users.set(newId, doc);
  saveLocalStore();
  return doc;
}

export async function updateUser(id: string, updates: Partial<UserDoc>): Promise<UserDoc | null> {
  if (isConnectedToMongo && mongoDb) {
    try {
      await mongoDb.collection('users').updateOne(
        { _id: new ObjectId(id) },
        { $set: updates }
      );
    } catch {
      await mongoDb.collection('users').updateOne(
        { _id: id as any },
        { $set: updates }
      );
    }
  }
  const existing = await findUserById(id);
  if (existing) {
    const updated = { ...existing, ...updates };
    memoryStore.users.set(id, updated);
    saveLocalStore();
    return updated;
  }
  return null;
}

export async function deleteUserById(id: string): Promise<boolean> {
  if (isConnectedToMongo && mongoDb) {
    try {
      await mongoDb.collection('users').deleteOne({ _id: new ObjectId(id) });
      await mongoDb.collection('scans').deleteMany({ user_id: id });
      await mongoDb.collection('journal_entries').deleteMany({ user_id: id });
      await mongoDb.collection('alerts').deleteMany({ user_id: id });
    } catch {
      await mongoDb.collection('users').deleteOne({ _id: id as any });
    }
  }
  memoryStore.users.delete(id);
  // delete cascades
  for (const [sId, scan] of memoryStore.scans.entries()) {
    if (scan.user_id === id) memoryStore.scans.delete(sId);
  }
  for (const [jId, journal] of memoryStore.journal_entries.entries()) {
    if (journal.user_id === id) memoryStore.journal_entries.delete(jId);
  }
  saveLocalStore();
  return true;
}

export async function getAllUsers(): Promise<UserDoc[]> {
  if (isConnectedToMongo && mongoDb) {
    const users = await mongoDb.collection('users').find().toArray();
    return users.map(u => ({ ...u, _id: u._id.toString() } as unknown as UserDoc));
  }
  return Array.from(memoryStore.users.values());
}

// Scans methods
export async function createScan(scan: Omit<ScanDoc, '_id'>): Promise<ScanDoc> {
  const newId = new ObjectId().toString();
  const doc: ScanDoc = {
    ...scan,
    _id: newId,
  };

  if (isConnectedToMongo && mongoDb) {
    await mongoDb.collection('scans').insertOne({ ...doc, _id: new ObjectId(newId) as any });
  }
  memoryStore.scans.set(newId, doc);

  // Sync real user scans count and level
  const user = await findUserById(scan.user_id);
  if (user) {
    const userScans = await getScansByUserId(user._id);
    const userJournals = await getJournalEntriesByUserId(user._id);
    const uniqueSpecies = new Set(
      userJournals.map(j => (j.insect_name || j.scan_result?.common_name || '').trim().toLowerCase()).filter(Boolean)
    );

    const totalScans = userScans.length;
    let newLevel: UserDoc['level'] = 'Beginner';
    if (totalScans > 200) newLevel = 'Master';
    else if (totalScans >= 51) newLevel = 'Expert';
    else if (totalScans >= 11) newLevel = 'Amateur';

    await updateUser(user._id, {
      scans_count: totalScans,
      level: newLevel,
      species_found: uniqueSpecies.size,
    });
  }

  saveLocalStore();
  return doc;
}

export async function getScansByUserId(userId: string): Promise<ScanDoc[]> {
  if (isConnectedToMongo && mongoDb) {
    const scans = await mongoDb.collection('scans').find({ user_id: userId }).sort({ timestamp: -1 }).toArray();
    return scans.map(s => ({ ...s, _id: s._id.toString() } as unknown as ScanDoc));
  }
  return Array.from(memoryStore.scans.values())
    .filter(s => s.user_id === userId)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

export async function getScanById(id: string): Promise<ScanDoc | null> {
  if (isConnectedToMongo && mongoDb) {
    try {
      const scan = await mongoDb.collection('scans').findOne({ _id: new ObjectId(id) });
      if (scan) return { ...scan, _id: scan._id.toString() } as unknown as ScanDoc;
    } catch {
      const scan = await mongoDb.collection('scans').findOne({ _id: id as any });
      if (scan) return { ...scan, _id: scan._id.toString() } as unknown as ScanDoc;
    }
  }
  return memoryStore.scans.get(id) || null;
}

export async function getAllScans(): Promise<ScanDoc[]> {
  if (isConnectedToMongo && mongoDb) {
    const scans = await mongoDb.collection('scans').find().toArray();
    return scans.map(s => ({ ...s, _id: s._id.toString() } as unknown as ScanDoc));
  }
  return Array.from(memoryStore.scans.values());
}

// Journal entries methods
export async function createJournalEntry(entry: Omit<JournalEntryDoc, '_id'>): Promise<JournalEntryDoc> {
  const newId = new ObjectId().toString();
  const doc: JournalEntryDoc = {
    ...entry,
    _id: newId,
  };

  if (isConnectedToMongo && mongoDb) {
    await mongoDb.collection('journal_entries').insertOne({ ...doc, _id: new ObjectId(newId) as any });
  }
  memoryStore.journal_entries.set(newId, doc);

  // Sync species_found count
  const user = await findUserById(entry.user_id);
  if (user) {
    const userJournals = await getJournalEntriesByUserId(user._id);
    const uniqueSpecies = new Set(
      userJournals.map(j => (j.insect_name || j.scan_result?.common_name || '').trim().toLowerCase()).filter(Boolean)
    );
    await updateUser(user._id, {
      species_found: uniqueSpecies.size,
    });
  }

  saveLocalStore();
  return doc;
}

export async function getJournalEntriesByUserId(userId: string): Promise<JournalEntryDoc[]> {
  if (isConnectedToMongo && mongoDb) {
    const entries = await mongoDb.collection('journal_entries').find({ user_id: userId }).sort({ date: -1 }).toArray();
    return entries.map(e => ({ ...e, _id: e._id.toString() } as unknown as JournalEntryDoc));
  }
  return Array.from(memoryStore.journal_entries.values())
    .filter(e => e.user_id === userId)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export async function updateJournalEntry(id: string, updates: Partial<JournalEntryDoc>): Promise<JournalEntryDoc | null> {
  if (isConnectedToMongo && mongoDb) {
    try {
      await mongoDb.collection('journal_entries').updateOne({ _id: new ObjectId(id) }, { $set: updates });
    } catch {
      await mongoDb.collection('journal_entries').updateOne({ _id: id as any }, { $set: updates });
    }
  }
  const entry = memoryStore.journal_entries.get(id);
  if (entry) {
    const updated = { ...entry, ...updates };
    memoryStore.journal_entries.set(id, updated);
    saveLocalStore();
    return updated;
  }
  return null;
}

export async function deleteJournalEntry(id: string): Promise<boolean> {
  let userId: string | null = null;
  if (isConnectedToMongo && mongoDb) {
    try {
      const existing = await mongoDb.collection('journal_entries').findOne({ _id: new ObjectId(id) });
      if (existing) userId = existing.user_id;
      await mongoDb.collection('journal_entries').deleteOne({ _id: new ObjectId(id) });
    } catch {
      const existing = await mongoDb.collection('journal_entries').findOne({ _id: id as any });
      if (existing) userId = existing.user_id;
      await mongoDb.collection('journal_entries').deleteOne({ _id: id as any });
    }
  }
  const memEntry = memoryStore.journal_entries.get(id);
  if (memEntry) {
    userId = userId || memEntry.user_id;
    memoryStore.journal_entries.delete(id);
  }

  // Sync species_found count
  if (userId) {
    const userJournals = await getJournalEntriesByUserId(userId);
    const uniqueSpecies = new Set(
      userJournals.map(j => (j.insect_name || j.scan_result?.common_name || '').trim().toLowerCase()).filter(Boolean)
    );
    await updateUser(userId, {
      species_found: uniqueSpecies.size,
    });
  }

  saveLocalStore();
  return true;
}

// Alerts methods
export async function createAlert(alert: Omit<AlertDoc, '_id'>): Promise<AlertDoc> {
  const newId = new ObjectId().toString();
  const doc: AlertDoc = {
    ...alert,
    _id: newId,
  };

  if (isConnectedToMongo && mongoDb) {
    await mongoDb.collection('alerts').insertOne({ ...doc, _id: new ObjectId(newId) as any });
  }
  memoryStore.alerts.set(newId, doc);
  saveLocalStore();
  return doc;
}

export async function getAlertsForUser(userId: string, region: string): Promise<AlertDoc[]> {
  if (isConnectedToMongo && mongoDb) {
    const alerts = await mongoDb.collection('alerts').find({
      $or: [
        { user_id: userId },
        { region: { $in: [region, 'ALL', 'Global'] } },
        { user_id: { $exists: false } }
      ]
    }).sort({ sent_at: -1 }).toArray();
    return alerts.map(a => ({ ...a, _id: a._id.toString() } as unknown as AlertDoc));
  }

  return Array.from(memoryStore.alerts.values())
    .filter(a => !a.user_id || a.user_id === userId || a.region === region || a.region === 'ALL')
    .sort((a, b) => new Date(b.sent_at).getTime() - new Date(a.sent_at).getTime());
}

export async function markAlertAsRead(id: string): Promise<boolean> {
  if (isConnectedToMongo && mongoDb) {
    try {
      await mongoDb.collection('alerts').updateOne({ _id: new ObjectId(id) }, { $set: { read: true } });
    } catch {
      await mongoDb.collection('alerts').updateOne({ _id: id as any }, { $set: { read: true } });
    }
  }
  const a = memoryStore.alerts.get(id);
  if (a) {
    a.read = true;
    saveLocalStore();
  }
  return true;
}

// Push subscriptions
export async function savePushSubscription(userId: string, subscription: any) {
  memoryStore.push_subscriptions.set(userId, subscription);
  if (isConnectedToMongo && mongoDb) {
    await mongoDb.collection('push_subscriptions').updateOne(
      { user_id: userId },
      { $set: { subscription, updated_at: new Date() } },
      { upsert: true }
    );
  }
}

// ----------------------------------------------------
// TRANSACTION LOGGING METHODS
// ----------------------------------------------------
export async function createTransaction(tx: Omit<TransactionDoc, '_id'>): Promise<TransactionDoc> {
  const newId = new ObjectId().toString();
  const doc: TransactionDoc = {
    ...tx,
    _id: newId,
  };

  if (isConnectedToMongo && mongoDb) {
    await mongoDb.collection('transactions').insertOne({ ...doc, _id: new ObjectId(newId) as any });
  }
  memoryStore.transactions.set(newId, doc);
  saveLocalStore();
  return doc;
}

export async function getTransactionsByUserId(userId: string): Promise<TransactionDoc[]> {
  if (isConnectedToMongo && mongoDb) {
    const txs = await mongoDb.collection('transactions').find({ user_id: userId }).sort({ created_at: -1 }).toArray();
    return txs.map(t => ({ ...t, _id: t._id.toString() } as unknown as TransactionDoc));
  }
  return Array.from(memoryStore.transactions.values())
    .filter(t => t.user_id === userId)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

export async function getAllTransactions(): Promise<TransactionDoc[]> {
  if (isConnectedToMongo && mongoDb) {
    const txs = await mongoDb.collection('transactions').find().sort({ created_at: -1 }).toArray();
    return txs.map(t => ({ ...t, _id: t._id.toString() } as unknown as TransactionDoc));
  }
  return Array.from(memoryStore.transactions.values())
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

export async function updateTransaction(id: string, updates: Partial<TransactionDoc>): Promise<TransactionDoc | null> {
  if (isConnectedToMongo && mongoDb) {
    try {
      await mongoDb.collection('transactions').updateOne(
        { _id: new ObjectId(id) },
        { $set: updates }
      );
    } catch {
      await mongoDb.collection('transactions').updateOne(
        { _id: id as any },
        { $set: updates }
      );
    }
  }

  const existing = memoryStore.transactions.get(id);
  if (existing) {
    const updated = { ...existing, ...updates };
    memoryStore.transactions.set(id, updated);
    saveLocalStore();
    return updated;
  }
  return null;
}

export async function findTransactionByCaptureId(captureId: string): Promise<TransactionDoc | null> {
  if (!captureId) return null;
  if (isConnectedToMongo && mongoDb) {
    const tx = await mongoDb.collection('transactions').findOne({ capture_id: captureId });
    if (tx) return { ...tx, _id: tx._id.toString() } as unknown as TransactionDoc;
    return null;
  }
  for (const tx of memoryStore.transactions.values()) {
    if (tx.capture_id === captureId) return tx;
  }
  return null;
}

export async function findTransactionByRefundId(refundId: string): Promise<TransactionDoc | null> {
  if (!refundId) return null;
  if (isConnectedToMongo && mongoDb) {
    const tx = await mongoDb.collection('transactions').findOne({ refund_id: refundId });
    if (tx) return { ...tx, _id: tx._id.toString() } as unknown as TransactionDoc;
    return null;
  }
  for (const tx of memoryStore.transactions.values()) {
    if (tx.refund_id === refundId) return tx;
  }
  return null;
}

export async function findUserBySubscriptionId(subId: string): Promise<UserDoc | null> {
  if (!subId) return null;
  if (isConnectedToMongo && mongoDb) {
    const user = await mongoDb.collection('users').findOne({
      $or: [
        { paypal_subscription_id: subId },
        { subscription_id: subId },
      ],
    });
    if (user) return { ...user, _id: user._id.toString() } as unknown as UserDoc;
    return null;
  }
  for (const user of memoryStore.users.values()) {
    if (user.paypal_subscription_id === subId || user.subscription_id === subId) return user;
  }
  return null;
}

export async function findTransactionBySubscriptionId(subId: string): Promise<TransactionDoc | null> {
  if (!subId) return null;
  if (isConnectedToMongo && mongoDb) {
    const tx = await mongoDb.collection('transactions').findOne({
      $or: [
        { subscription_id: subId },
        { order_id: subId },
        { capture_id: subId },
      ],
    });
    if (tx) return { ...tx, _id: tx._id.toString() } as unknown as TransactionDoc;
    return null;
  }
  for (const tx of memoryStore.transactions.values()) {
    if (tx.subscription_id === subId || tx.order_id === subId || tx.capture_id === subId) return tx;
  }
  return null;
}

export async function findFirstCompletedTransactionForUser(userId: string): Promise<TransactionDoc | null> {
  if (!userId) return null;
  const userTxs = await getTransactionsByUserId(userId);
  const completedTxs = userTxs
    .filter(t => t.status === 'COMPLETED' || t.status === 'REFUNDED')
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()); // oldest first

  return completedTxs[0] || null;
}

