export type Role = 'ADMIN' | 'USER' | 'LEGAL_OFFICER' | 'ADVOCATE';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  designation: string;
  courtOrDepartment: string;
  badgeNumber: string;
  status: 'ACTIVE' | 'DISABLED';
  createdAt: string;
  lastLoginAt?: string;
}

export interface Case {
  id: string;
  cnrNumber: string; // Indian Judiciary CNR (e.g., DLHC01-008421-2025)
  title: string;
  court: string; // e.g. High Court of Delhi, Supreme Court of India
  petitioner: string;
  respondent: string;
  legalAct: string; // e.g., Bharatiya Sakshya Adhiniyam, 2023 / Indian Penal Code
  status: 'ACTIVE' | 'UNDER_HEARING' | 'DISPOSED';
  assignedLegalOfficerId: string;
  assignedAdvocateId: string;
  authorizedUserId: string;
  filingDate: string;
  hearingDate: string;
}

export type AccessLevel = 'PUBLIC' | 'CONFIDENTIAL' | 'RESTRICTED' | 'SEALED';

export type DocumentStatus =
  | 'PENDING_VERIFICATION'
  | 'VERIFIED'
  | 'INTEGRITY_WARNING'
  | 'ARCHIVED';

export interface Document {
  id: string;
  caseId: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  uploadedBy: string; // User Name
  uploadedById: string;
  uploadedRole: Role;
  uploadedDate: string;
  sha256Hash: string;
  accessLevel: AccessLevel;
  status: DocumentStatus;
  version: number;
  isOriginal: boolean;
  isEvidence: boolean;
  description: string;
  evidenceId?: string;
  filePreviewText?: string;
  bsaSection63Certified: boolean;
}

export interface EvidenceRecord {
  id: string;
  documentId: string;
  caseId: string;
  evidenceCode: string; // e.g. EVD-DL-2026-081
  title: string;
  evidenceType: 'DIGITAL_FORENSICS' | 'CCTV_FOOTAGE' | 'SIGNED_CONTRACT' | 'CALL_RECORDS' | 'FINANCIAL_LEDGER';
  sha256Hash: string;
  registeredBy: string;
  registeredById: string;
  registeredRole: Role;
  registeredAt: string;
  chainOfCustody: Array<{
    timestamp: string;
    officer: string;
    action: string;
    hashVerified: boolean;
  }>;
  isOriginalImmutable: true;
  versions: Array<{
    versionNumber: number;
    sha256Hash: string;
    createdBy: string;
    createdAt: string;
    reason: string;
  }>;
}

export type AuditAction =
  | 'LOGIN_SUCCESS'
  | 'LOGIN_FAILED'
  | 'LOGOUT'
  | 'CASE_CREATED'
  | 'DOCUMENT_UPLOAD'
  | 'DOCUMENT_UPLOADED'
  | 'DOCUMENT_VIEWED'
  | 'DOCUMENT_DOWNLOADED'
  | 'DOCUMENT_VERIFY'
  | 'DOCUMENT_VERIFIED'
  | 'EVIDENCE_REGISTERED'
  | 'USER_CREATED'
  | 'USER_DISABLED'
  | 'ACCESS_DENIED'
  | 'TAMPER_ATTEMPT_BLOCKED';

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  userRole: Role | 'UNKNOWN';
  action: AuditAction;
  caseId?: string;
  documentId?: string;
  timestamp: string;
  result: 'SUCCESS' | 'DENIED' | 'FAILED' | 'TAMPER_DETECTED' | 'INTEGRITY_WARNING';
  details: string;
  ipAddress: string;
}

export interface AuthSession {
  token: string;
  user: User;
  expiresAt: string;
}

export interface IntegrityCheckResult {
  documentId: string;
  fileName: string;
  storedHash: string;
  calculatedHash: string;
  status: 'VERIFIED' | 'INTEGRITY_WARNING' | 'INTACT' | 'COMPROMISED';
  verdict: string;
  message: string;
  verifiedAt: string;
  verifiedBy: string;
  verificationOfficerRole: Role;
  chainOfTrustValid: boolean;
  isMatch: boolean;
}
