// Group D: Documents & Certifications

import type {
  DocumentCategory,
  DocumentVerificationStatus,
  DocumentStatus,
  UploadStatus,
  CertificationPathwayStatus,
  UserCertificationStatus,
} from './enums';

/** documents — expanded in DOC-206 */
export interface Document {
  id: string;
  user_id: string;
  file_name: string;
  file_type: string;
  file_size: number;
  storage_path: string;
  storage_bucket: string;
  title: string | null;
  description: string | null;
  category: DocumentCategory;
  subcategory: string | null;
  issuing_authority: string | null;
  document_date: string | null;
  expiration_date: string | null;
  linked_qualification_id: string | null;
  linked_deployment_id: string | null;
  linked_incident_id: string | null;
  ai_extracted_data: Record<string, unknown> | null;
  verification_status: DocumentVerificationStatus;
  reviewed_by: string | null;
  reviewed_at: string | null;
  status: DocumentStatus;
  created_at: string;
  updated_at: string;
  // Legacy fields from DOC-002 (may not exist on new rows)
  org_id?: string | null;
  filename?: string;
  blob_url?: string;
  mime_type?: string;
  file_size_bytes?: number;
  linked_record_type?: string | null;
  linked_record_id?: string | null;
  upload_status?: UploadStatus;
}

export interface DocumentSummary {
  id: string;
  file_name: string;
  file_type: string;
  file_size: number;
  title: string | null;
  category: DocumentCategory;
  document_date: string | null;
  expiration_date: string | null;
  verification_status: DocumentVerificationStatus;
  status: DocumentStatus;
  created_at: string;
  linked_qualification_name: string | null;
  linked_deployment_position: string | null;
}

export interface DocumentUploadInput {
  title?: string;
  description?: string;
  category: DocumentCategory;
  subcategory?: string;
  issuing_authority?: string;
  document_date?: string;
  expiration_date?: string;
  linked_qualification_id?: string;
  linked_deployment_id?: string;
  linked_incident_id?: string;
}

/** certification_pathways — 9 columns */
export interface CertificationPathway {
  id: string;
  title: string;
  discipline: string | null;
  description: string | null;
  required_positions: Record<string, unknown> | null;
  required_training: Record<string, unknown> | null;
  required_evaluations: number | null;
  requirements_json: Record<string, unknown> | null;
  status: CertificationPathwayStatus;
  created_at: string;
}

/** user_certifications — 10 columns */
export interface UserCertification {
  id: string;
  user_id: string;
  pathway_id: string;
  engagement_id: string | null;
  status: UserCertificationStatus;
  progress_json: Record<string, unknown> | null;
  certified_at: string | null;
  expires_at: string | null;
  approved_by: string | null;
  approved_at: string | null;
  created_at: string;
}
