// ------------------------------------------------------------
// EVINEX DEMO ACCOUNTS — single source of truth
//
// These credentials are intentionally public (demo system, see
// README "Compliance Notes"). They are the ONLY login handles
// seeded by the platform; real accounts are created by the Admin
// Dashboard and use PBKDF2 hashing with per-user random salts.
//
// SECURITY:
//  - Passwords are NEVER stored in plaintext: buildDemoUsers()
//    derives PBKDF2-HMAC-SHA512 (10k iterations, 64-byte key)
//    hashes with a fresh 128-bit random salt per boot.
//  - Only the hash + salt are persisted to SQLite; the API layer
//    sanitizes UserRecord objects before any JSON leaves server.
//  - `npm run seed` / server boot upsert these accounts
//    idempotently (never duplicates, heals broken prod DBs).
// ------------------------------------------------------------
import crypto from 'crypto';
import type { Role, User } from './types.js';

export interface UserRecord extends User {
  passwordHash: string;
  salt: string;
}

// PBKDF2-HMAC-SHA512, 10,000 iterations, 64-byte derived key
export function hashPassword(password: string, salt: string): string {
  return crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
}

export function newSalt(): string {
  return crypto.randomBytes(16).toString('hex');
}

interface DemoAccountDef {
  id: string;
  name: string;
  email: string;
  role: Role;
  password: string;
  designation: string;
  courtOrDepartment: string;
  badgeNumber: string;
  createdAt: string;
}

export const DEMO_ACCOUNTS: readonly DemoAccountDef[] = [
  {
    id: 'USR-ADM-001',
    name: 'Suryakant Sharma',
    email: 'admin@evinex.demo',
    role: 'ADMIN',
    password: 'Evinex@Admin2026',
    designation: 'Principal Systems Registrar & Director',
    courtOrDepartment: 'National Evidentiary Repository, New Delhi',
    badgeNumber: 'EVX-NIC-9901',
    createdAt: '2025-01-15T09:00:00Z',
  },
  {
    id: 'USR-USR-002',
    name: 'Ananya Deshmukh',
    email: 'user@evinex.demo',
    role: 'USER',
    password: 'Evinex@User2026',
    designation: 'Authorized Litigant / Petitioner Representative',
    courtOrDepartment: 'Civil & Commercial Division, Delhi',
    badgeNumber: 'LIT-DL-4482',
    createdAt: '2025-02-10T11:30:00Z',
  },
  {
    id: 'USR-LGL-003',
    name: 'Vikramaditya Iyer',
    email: 'legalofficer@evinex.demo',
    role: 'LEGAL_OFFICER',
    password: 'Evinex@Legal2026',
    designation: 'Senior Legal Officer & Digital Evidence Custodian',
    courtOrDepartment: 'High Court of Delhi - Digital Registry',
    badgeNumber: 'JUD-DLHC-7104',
    createdAt: '2025-01-20T14:15:00Z',
  },
  {
    id: 'USR-ADV-004',
    name: 'Meenakshi Sundaram',
    email: 'advocate@evinex.demo',
    role: 'ADVOCATE',
    password: 'Evinex@Advocate2026',
    designation: 'Senior Counsel & Bar Council Member',
    courtOrDepartment: 'Bar Council of Delhi (Enrollment: D/1842/2012)',
    badgeNumber: 'BCD-ADV-1842',
    createdAt: '2025-02-01T10:00:00Z',
  },
] as const;

// Mints fully hashed demo user records with FRESH random salts.
// Called on every boot / seed run so each deployment always has
// working demo credentials (previous hashes are safely replaced).
export function buildDemoUsers(): UserRecord[] {
  return DEMO_ACCOUNTS.map((account) => {
    const salt = newSalt();
    return {
      id: account.id,
      name: account.name,
      email: account.email,
      role: account.role,
      designation: account.designation,
      courtOrDepartment: account.courtOrDepartment,
      badgeNumber: account.badgeNumber,
      status: 'ACTIVE' as const,
      createdAt: account.createdAt,
      passwordHash: hashPassword(account.password, salt),
      salt,
    };
  });
}