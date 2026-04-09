export type DocumentCategory =
  | 'certificate'
  | 'license'
  | 'training_record'
  | 'assessment_report'
  | 'field_report'
  | 'self_assessment'
  | 'photo_id'
  | 'other';

export type UploadStatus = 'pending' | 'processed' | 'failed';

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
  created_at: Date;
}

export type CertificationPathwayStatus = 'active' | 'draft' | 'retired';

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
  created_at: Date;
}

export type UserCertificationStatus =
  | 'in_progress'
  | 'pending_review'
  | 'certified'
  | 'expired'
  | 'revoked';

export interface UserCertification {
  id: string;
  user_id: string;
  pathway_id: string;
  status: UserCertificationStatus;
  progress_json: Record<string, unknown> | null;
  certified_at: Date | null;
  expires_at: Date | null;
  approved_by: string | null;
  approved_at: Date | null;
  created_at: Date;
}
