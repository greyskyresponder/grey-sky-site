import type {
  VerificationTier,
  DeploymentRecordStatus,
  IncidentType,
  NimsType,
  OperationalSetting,
  CompensationStatus,
} from './enums';

export interface DeploymentRecordDetail {
  id: string;
  userId: string;
  incidentId: string | null;
  positionId: string | null;
  positionFreeText: string | null;
  orgId: string | null;
  startDate: string;
  endDate: string | null;
  hours: number | null;
  totalDays: number | null;
  operationalPeriods: number | null;
  operationalSetting: OperationalSetting | null;
  operationalSettingOther: string | null;
  compensationStatus: CompensationStatus | null;
  compensationStatusOther: string | null;
  dutiesSummary: string | null;
  keyAccomplishments: string | null;
  personnelSupervised: string | null;
  equipmentSupervised: string | null;
  verificationTier: VerificationTier;
  supervisorName: string | null;
  supervisorEmail: string | null;
  notes: string | null;
  status: DeploymentRecordStatus;
  selfCertifiedAt: string | null;
  createdAt: string;
  updatedAt: string;
  incident: IncidentSummary | null;
  position: PositionSummary | null;
  organization: OrganizationSummary | null;
  validationCount: number;
  evaluationCount: number;
}

export interface IncidentSummary {
  id: string;
  name: string;
  type: IncidentType;
  state: string | null;
  startDate: string;
  endDate: string | null;
  femaDisasterNumber: string | null;
}

export interface PositionSummary {
  id: string;
  title: string;
  nimsType: NimsType | null;
  resourceCategory: string | null;
  discipline: string | null;
}

export interface OrganizationSummary {
  id: string;
  name: string;
  type: string;
}

export interface CreateDeploymentPayload {
  incidentId: string | null;
  incidentName: string | null;
  incidentType: IncidentType | null;
  incidentState: string | null;
  incidentStartDate: string | null;
  positionId: string | null;
  positionFreeText: string | null;
  orgId: string | null;
  startDate: string;
  endDate: string | null;
  hours: number | null;
  totalDays: number | null;
  operationalPeriods: number | null;
  operationalSetting: OperationalSetting | null;
  operationalSettingOther: string | null;
  compensationStatus: CompensationStatus | null;
  compensationStatusOther: string | null;
  dutiesSummary: string | null;
  keyAccomplishments: string | null;
  personnelSupervised: string | null;
  equipmentSupervised: string | null;
  supervisorName: string | null;
  supervisorEmail: string | null;
  notes: string | null;
}

export interface DeploymentFilters {
  status: DeploymentRecordStatus | 'all';
  verificationTier: VerificationTier | 'all';
  dateFrom: string | null;
  dateTo: string | null;
  search: string;
  page: number;
  perPage: number;
}
