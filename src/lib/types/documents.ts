// Group D: Documents & Certifications

import type {
  DocumentCategory,
  UploadStatus,
  CertificationPathwayStatus,
  UserCertificationStatus,
} from './enums';

/** documents — 12 columns */
export interface Document {
  id: string;
  user_id: string;
  org_id: string | null;
  filename: string;
  blob_url: string;
  mime_type: string;
  file_size_bytes: number;
  category: DocumentCategory;
  linked_record_type: string | null;
  linked_record_id: string | null;
  ai_extracted_data: Record<string, unknown> | null;
  upload_status: UploadStatus;
  created_at: string;
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
