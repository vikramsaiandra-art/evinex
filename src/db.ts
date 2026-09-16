// -----------------------------------------------------------
// EVINEX SQLITE PERSISTENCE LAYER (node:sqlite, zero dependencies)
// File location: data/evinex.db (override with EVINEX_DB_PATH)
// -----------------------------------------------------------
import { DatabaseSync } from 'node:sqlite';
import path from 'path';
import fs from 'fs';
import type { User, Case, Document, EvidenceRecord, AuditLog, Role } from './types.js';

export interface UserRecord extends User {
  passwordHash: string;
  salt: string;
}

const DB_PATH = process.env.EVINEX_DB_PATH || path.join(process.cwd(), 'data', 'evinex.db');

let db: DatabaseSync;

// -----------------------------------------------------------
// SCHEMA
// -----------------------------------------------------------
function createSchema(database: DatabaseSync): void {
  database.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      role TEXT NOT NULL,
      designation TEXT NOT NULL,
      court_or_department TEXT NOT NULL,
      badge_number TEXT NOT NULL,
      status TEXT NOT NULL,
      created_at TEXT NOT NULL,
      last_login_at TEXT,
      password_hash TEXT NOT NULL,
      salt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS sessions (
      token TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id),
      expires_at INTEGER NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS cases (
      id TEXT PRIMARY KEY,
      cnr_number TEXT NOT NULL,
      title TEXT NOT NULL,
      court TEXT NOT NULL,
      petitioner TEXT NOT NULL,
      respondent TEXT NOT NULL,
      legal_act TEXT NOT NULL,
      status TEXT NOT NULL,
      assigned_legal_officer_id TEXT NOT NULL,
      assigned_advocate_id TEXT NOT NULL,
      authorized_user_id TEXT NOT NULL,
      filing_date TEXT NOT NULL,
      hearing_date TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS documents (
      id TEXT PRIMARY KEY,
      case_id TEXT NOT NULL REFERENCES cases(id),
      file_name TEXT NOT NULL,
      file_type TEXT NOT NULL,
      file_size INTEGER NOT NULL,
      uploaded_by TEXT NOT NULL,
      uploaded_by_id TEXT NOT NULL,
      uploaded_role TEXT NOT NULL,
      uploaded_date TEXT NOT NULL,
      sha256_hash TEXT NOT NULL,
      access_level TEXT NOT NULL,
      status TEXT NOT NULL,
      version INTEGER NOT NULL DEFAULT 1,
      is_original INTEGER NOT NULL DEFAULT 1,
      is_evidence INTEGER NOT NULL DEFAULT 0,
      description TEXT NOT NULL,
      evidence_id TEXT,
      file_preview_text TEXT,
      bsa_section63_certified INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS evidence (
      id TEXT PRIMARY KEY,
      document_id TEXT NOT NULL REFERENCES documents(id),
      case_id TEXT NOT NULL REFERENCES cases(id),
      evidence_code TEXT NOT NULL,
      title TEXT NOT NULL,
      evidence_type TEXT NOT NULL,
      sha256_hash TEXT NOT NULL,
      registered_by TEXT NOT NULL,
      registered_by_id TEXT NOT NULL,
      registered_role TEXT NOT NULL,
      registered_at TEXT NOT NULL,
      is_original_immutable INTEGER NOT NULL DEFAULT 1,
      chain_of_custody TEXT NOT NULL DEFAULT '[]',
      versions TEXT NOT NULL DEFAULT '[]'
    );

    CREATE TABLE IF NOT EXISTS audit_logs (
      seq INTEGER PRIMARY KEY AUTOINCREMENT,
      id TEXT NOT NULL UNIQUE,
      user_id TEXT NOT NULL,
      user_name TEXT NOT NULL,
      user_role TEXT NOT NULL,
      action TEXT NOT NULL,
      case_id TEXT,
      document_id TEXT,
      timestamp TEXT NOT NULL,
      result TEXT NOT NULL,
      details TEXT NOT NULL,
      ip_address TEXT NOT NULL
    );
  `);
}


// -----------------------------------------------------------
// ROW <-> OBJECT MAPPERS
// -----------------------------------------------------------
function rowToUser(row: Record<string, unknown>): UserRecord {
  return {
    id: row.id as string,
    name: row.name as string,
    email: row.email as string,
    role: row.role as Role,
    designation: row.designation as string,
    courtOrDepartment: row.court_or_department as string,
    badgeNumber: row.badge_number as string,
    status: row.status as 'ACTIVE' | 'DISABLED',
    createdAt: row.created_at as string,
    lastLoginAt: (row.last_login_at as string) || undefined,
    passwordHash: row.password_hash as string,
    salt: row.salt as string,
  };
}

function rowToCase(row: Record<string, unknown>): Case {
  return {
    id: row.id as string,
    cnrNumber: row.cnr_number as string,
    title: row.title as string,
    court: row.court as string,
    petitioner: row.petitioner as string,
    respondent: row.respondent as string,
    legalAct: row.legal_act as string,
    status: row.status as Case['status'],
    assignedLegalOfficerId: row.assigned_legal_officer_id as string,
    assignedAdvocateId: row.assigned_advocate_id as string,
    authorizedUserId: row.authorized_user_id as string,
    filingDate: row.filing_date as string,
    hearingDate: row.hearing_date as string,
  };
}

function rowToDocument(row: Record<string, unknown>): Document {
  return {
    id: row.id as string,
    caseId: row.case_id as string,
    fileName: row.file_name as string,
    fileType: row.file_type as string,
    fileSize: row.file_size as number,
    uploadedBy: row.uploaded_by as string,
    uploadedById: row.uploaded_by_id as string,
    uploadedRole: row.uploaded_role as Role,
    uploadedDate: row.uploaded_date as string,
    sha256Hash: row.sha256_hash as string,
    accessLevel: row.access_level as Document['accessLevel'],
    status: row.status as Document['status'],
    version: row.version as number,
    isOriginal: Boolean(row.is_original),
    isEvidence: Boolean(row.is_evidence),
    description: row.description as string,
    evidenceId: (row.evidence_id as string) || undefined,
    filePreviewText: (row.file_preview_text as string) || undefined,
    bsaSection63Certified: Boolean(row.bsa_section63_certified),
  };
}

function rowToEvidence(row: Record<string, unknown>): EvidenceRecord {
  return {
    id: row.id as string,
    documentId: row.document_id as string,
    caseId: row.case_id as string,
    evidenceCode: row.evidence_code as string,
    title: row.title as string,
    evidenceType: row.evidence_type as EvidenceRecord['evidenceType'],
    sha256Hash: row.sha256_hash as string,
    registeredBy: row.registered_by as string,
    registeredById: row.registered_by_id as string,
    registeredRole: row.registered_role as Role,
    registeredAt: row.registered_at as string,
    chainOfCustody: JSON.parse(row.chain_of_custody as string),
    isOriginalImmutable: true,
    versions: JSON.parse(row.versions as string),
  };
}

function rowToAuditLog(row: Record<string, unknown>): AuditLog {
  return {
    id: row.id as string,
    userId: row.user_id as string,
    userName: row.user_name as string,
    userRole: row.user_role as AuditLog['userRole'],
    action: row.action as AuditLog['action'],
    caseId: (row.case_id as string) || undefined,
    documentId: (row.document_id as string) || undefined,
    timestamp: row.timestamp as string,
    result: row.result as AuditLog['result'],
    details: row.details as string,
    ipAddress: row.ip_address as string,
  };
}


// -----------------------------------------------------------
// WRITE HELPERS (called by server.ts at each mutation point)
// -----------------------------------------------------------
export function persistUser(user: UserRecord): void {
  db.prepare(
    `INSERT INTO users (id, name, email, role, designation, court_or_department, badge_number, status, created_at, last_login_at, password_hash, salt)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(id) DO UPDATE SET
       name=excluded.name, email=excluded.email, role=excluded.role, designation=excluded.designation,
       court_or_department=excluded.court_or_department, badge_number=excluded.badge_number,
       status=excluded.status, last_login_at=excluded.last_login_at,
       password_hash=excluded.password_hash, salt=excluded.salt`
  ).run(
    user.id,
    user.name,
    user.email,
    user.role,
    user.designation,
    user.courtOrDepartment,
    user.badgeNumber,
    user.status,
    user.createdAt,
    user.lastLoginAt || null,
    user.passwordHash,
    user.salt
  );
}

export function persistSession(token: string, userId: string, expiresAt: number): void {
  db.prepare(
    `INSERT INTO sessions (token, user_id, expires_at, created_at) VALUES (?, ?, ?, ?)
     ON CONFLICT(token) DO UPDATE SET expires_at=excluded.expires_at`
  ).run(token, userId, expiresAt, new Date().toISOString());
}

export function deleteSessionRow(token: string): void {
  db.prepare('DELETE FROM sessions WHERE token = ?').run(token);
}

export function persistCase(record: Case): void {
  db.prepare(
    `INSERT INTO cases (id, cnr_number, title, court, petitioner, respondent, legal_act, status,
       assigned_legal_officer_id, assigned_advocate_id, authorized_user_id, filing_date, hearing_date)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(id) DO UPDATE SET status=excluded.status, hearing_date=excluded.hearing_date`
  ).run(
    record.id,
    record.cnrNumber,
    record.title,
    record.court,
    record.petitioner,
    record.respondent,
    record.legalAct,
    record.status,
    record.assignedLegalOfficerId,
    record.assignedAdvocateId,
    record.authorizedUserId,
    record.filingDate,
    record.hearingDate
  );
}

export function persistDocument(doc: Document): void {
  db.prepare(
    `INSERT INTO documents (id, case_id, file_name, file_type, file_size, uploaded_by, uploaded_by_id,
       uploaded_role, uploaded_date, sha256_hash, access_level, status, version, is_original,
       is_evidence, description, evidence_id, file_preview_text, bsa_section63_certified)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(id) DO UPDATE SET
       status=excluded.status, version=excluded.version, bsa_section63_certified=excluded.bsa_section63_certified`
  ).run(
    doc.id,
    doc.caseId,
    doc.fileName,
    doc.fileType,
    doc.fileSize,
    doc.uploadedBy,
    doc.uploadedById,
    doc.uploadedRole,
    doc.uploadedDate,
    doc.sha256Hash,
    doc.accessLevel,
    doc.status,
    doc.version,
    doc.isOriginal ? 1 : 0,
    doc.isEvidence ? 1 : 0,
    doc.description,
    doc.evidenceId || null,
    doc.filePreviewText || null,
    doc.bsaSection63Certified ? 1 : 0
  );
}

export function persistEvidence(record: EvidenceRecord): void {
  db.prepare(
    `INSERT INTO evidence (id, document_id, case_id, evidence_code, title, evidence_type, sha256_hash,
       registered_by, registered_by_id, registered_role, registered_at, is_original_immutable,
       chain_of_custody, versions)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(id) DO UPDATE SET
       chain_of_custody=excluded.chain_of_custody, versions=excluded.versions`
  ).run(
    record.id,
    record.documentId,
    record.caseId,
    record.evidenceCode,
    record.title,
    record.evidenceType,
    record.sha256Hash,
    record.registeredBy,
    record.registeredById,
    record.registeredRole,
    record.registeredAt,
    1,
    JSON.stringify(record.chainOfCustody),
    JSON.stringify(record.versions)
  );
}

export function persistAuditLog(entry: AuditLog): void {
  db.prepare(
    `INSERT INTO audit_logs (id, user_id, user_name, user_role, action, case_id, document_id,
       timestamp, result, details, ip_address)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(
    entry.id,
    entry.userId,
    entry.userName,
    entry.userRole,
    entry.action,
    entry.caseId || null,
    entry.documentId || null,
    entry.timestamp,
    entry.result,
    entry.details,
    entry.ipAddress
  );
}


// -----------------------------------------------------------
// INITIALIZATION: create schema, seed if empty, load rows into
// the in-memory arrays used by the API layer.
// -----------------------------------------------------------
export interface DbStores {
  users: UserRecord[];
  cases: Case[];
  documents: Document[];
  evidence: EvidenceRecord[];
  auditLogs: AuditLog[];
  sessions: Map<string, { user: User; expiresAt: number }>;
}

function loadInto<T>(target: T[], rows: T[]): void {
  target.length = 0;
  for (const row of rows) target.push(row);
}

// -----------------------------------------------------------
// DEDUPLICATION: removes duplicate rows that may have crept in
// (e.g. from repeated seeding) plus expired/orphaned sessions.
// Runs on every startup before data is loaded.
// -----------------------------------------------------------
function dedupeDatabase(database: DatabaseSync): void {
  const removed: string[] = [];

  // Duplicate audit ledger entries sharing the same logical id
  const audit = database
    .prepare('DELETE FROM audit_logs WHERE seq NOT IN (SELECT MIN(seq) FROM audit_logs GROUP BY id)')
    .run();
  if (audit.changes > 0) removed.push(`${audit.changes} duplicate audit logs`);

  // Duplicate user accounts sharing the same email (case-insensitive)
  const users = database
    .prepare('DELETE FROM users WHERE rowid NOT IN (SELECT MIN(rowid) FROM users GROUP BY lower(email))')
    .run();
  if (users.changes > 0) removed.push(`${users.changes} duplicate user accounts`);

  // Duplicate cases / documents / evidence sharing the same id
  const cases = database
    .prepare('DELETE FROM cases WHERE rowid NOT IN (SELECT MIN(rowid) FROM cases GROUP BY id)')
    .run();
  if (cases.changes > 0) removed.push(`${cases.changes} duplicate cases`);

  const docs = database
    .prepare('DELETE FROM documents WHERE rowid NOT IN (SELECT MIN(rowid) FROM documents GROUP BY id)')
    .run();
  if (docs.changes > 0) removed.push(`${docs.changes} duplicate documents`);

  const evidence = database
    .prepare('DELETE FROM evidence WHERE rowid NOT IN (SELECT MIN(rowid) FROM evidence GROUP BY id)')
    .run();
  if (evidence.changes > 0) removed.push(`${evidence.changes} duplicate evidence records`);

  // Sessions: expired tokens or tokens referencing deleted users
  const expired = database.prepare('DELETE FROM sessions WHERE expires_at <= ?').run(Date.now());
  if (expired.changes > 0) removed.push(`${expired.changes} expired sessions`);

  const orphaned = database
    .prepare('DELETE FROM sessions WHERE user_id NOT IN (SELECT id FROM users)')
    .run();
  if (orphaned.changes > 0) removed.push(`${orphaned.changes} orphaned sessions`);

  if (removed.length > 0) {
    console.log(`[DB] Deduplication complete - removed: ${removed.join(', ')}.`);
  }
}

export function initDatabase(stores: DbStores): void {
  const dbDir = path.dirname(DB_PATH);
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }

  db = new DatabaseSync(DB_PATH);
  db.exec('PRAGMA journal_mode = WAL;');
  db.exec('PRAGMA foreign_keys = ON;');
  createSchema(db);
  dedupeDatabase(db);

  const isFirstRun =
    (db.prepare('SELECT COUNT(*) AS c FROM users').get() as { c: number }).c === 0;

  if (isFirstRun) {
    console.log(`[DB] First run detected. Seeding EVINEX database at ${DB_PATH}...`);
    db.exec('BEGIN');
    try {
      for (const u of stores.users) persistUser(u);
      for (const c of stores.cases) persistCase(c);
      for (const d of stores.documents) persistDocument(d);
      for (const e of stores.evidence) persistEvidence(e);
      for (const l of stores.auditLogs) persistAuditLog(l);
      db.exec('COMMIT');
      console.log('[DB] Seed complete: users, cases, documents, evidence, audit ledger.');
    } catch (err) {
      db.exec('ROLLBACK');
      throw err;
    }
  }

  // Load persisted state back into the in-memory stores (source of truth: DB)
  const users = (db.prepare('SELECT * FROM users ORDER BY created_at ASC').all() as Record<string, unknown>[]).map(rowToUser);
  const cases = (db.prepare('SELECT * FROM cases ORDER BY filing_date ASC').all() as Record<string, unknown>[]).map(rowToCase);
  const documents = (db.prepare('SELECT * FROM documents ORDER BY uploaded_date ASC').all() as Record<string, unknown>[]).map(rowToDocument);
  const evidence = (db.prepare('SELECT * FROM evidence ORDER BY registered_at ASC').all() as Record<string, unknown>[]).map(rowToEvidence);
  const logs = (db.prepare('SELECT * FROM audit_logs ORDER BY seq DESC').all() as Record<string, unknown>[]).map(rowToAuditLog);

  loadInto(stores.users, users);
  loadInto(stores.cases, cases);
  loadInto(stores.documents, documents);
  loadInto(stores.evidence, evidence);
  loadInto(stores.auditLogs, logs);

  // Restore non-expired sessions so logins survive server restarts
  const sessionRows = db
    .prepare('SELECT token, user_id, expires_at FROM sessions WHERE expires_at > ?')
    .all(Date.now()) as { token: string; user_id: string; expires_at: number }[];
  for (const s of sessionRows) {
    const user = stores.users.find((u) => u.id === s.user_id);
    if (user) {
      const { passwordHash: _ph, salt: _s, ...sanitized } = user;
      stores.sessions.set(s.token, { user: sanitized, expiresAt: s.expires_at });
    }
  }

  // Purge expired sessions from disk
  db.prepare('DELETE FROM sessions WHERE expires_at <= ?').run(Date.now());

  console.log(
    `[DB] Loaded ${stores.users.length} users, ${stores.cases.length} cases, ${stores.documents.length} documents, ${stores.evidence.length} evidence records, ${stores.auditLogs.length} audit logs (${sessionRows.length} active sessions).`
  );
}

