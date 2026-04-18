'use client';

import { useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { searchIncidents } from '@/lib/queries/incidents';
import { searchPositions } from '@/lib/queries/positions-search';
import { createDeploymentAction, updateDeploymentAction } from '@/lib/actions/deployments';
import type { Position } from '@/lib/types/deployments';
import type { IncidentSummary as Incident } from '@/lib/types/incidents';
import type { DeploymentRecordDetail } from '@/lib/types/deployment-views';
import type { OperationalSetting, CompensationStatus } from '@/lib/types/enums';

const inputClass =
  'w-full rounded-md border border-[var(--gs-cloud)] px-3 py-2 text-sm text-[var(--gs-navy)] focus:border-[var(--gs-gold)] focus:ring-1 focus:ring-[var(--gs-gold)] focus:outline-none';
const labelClass = 'block text-sm font-medium text-[var(--gs-steel)] mb-1';
const sectionClass =
  'bg-white rounded-lg shadow-sm border border-[var(--gs-cloud)] p-6';
const sectionTitle = 'text-lg font-semibold text-[var(--gs-navy)]';
const sectionSubtitle = 'text-xs text-[var(--gs-steel)] mt-0.5';
const blockBadge =
  'inline-block text-[10px] uppercase tracking-wide text-[var(--gs-steel)] bg-[var(--gs-cloud)]/40 rounded px-1.5 py-0.5 ml-2 align-middle';

const OPERATIONAL_SETTINGS: { value: OperationalSetting; label: string; hint: string }[] = [
  { value: 'eoc', label: 'EOC', hint: 'Emergency Operations Center' },
  { value: 'icp', label: 'ICP', hint: 'Incident Command Post' },
  { value: 'fob', label: 'FOB', hint: 'Forward Operating Base' },
  { value: 'boo', label: 'BOO', hint: 'Base of Operations' },
  { value: 'field_staging', label: 'Field / Staging', hint: 'Field or staging area' },
  { value: 'jfo', label: 'JFO', hint: 'Joint Field Office' },
  { value: 'other', label: 'Other', hint: 'Describe below' },
];

const COMPENSATION_STATUSES: { value: CompensationStatus; label: string; hint: string }[] = [
  { value: 'paid', label: 'Paid', hint: 'Compensated assignment' },
  { value: 'volunteer', label: 'Volunteer', hint: 'Unpaid service' },
  { value: 'mutual_aid', label: 'Mutual Aid', hint: 'Served via mutual aid agreement' },
  { value: 'other', label: 'Other', hint: 'Describe below' },
];

interface Props {
  record?: DeploymentRecordDetail;
  categories: string[];
  userOrgs: { id: string; name: string }[];
}

function computeTotalDays(startDate: string, endDate: string | null): number | null {
  if (!startDate) return null;
  const start = new Date(startDate);
  const end = endDate ? new Date(endDate) : new Date();
  if (isNaN(start.getTime()) || isNaN(end.getTime())) return null;
  const ms = end.getTime() - start.getTime();
  if (ms < 0) return null;
  return Math.floor(ms / (1000 * 60 * 60 * 24)) + 1;
}

export function RecordForm({ record, categories, userOrgs }: Props) {
  const router = useRouter();
  const supabase = createClient();
  const isEdit = !!record;
  const today = useMemo(() => new Date().toISOString().split('T')[0], []);

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  // Tracks which action button was clicked. React state updates aren't flushed
  // between onClick and onSubmit in the same event, so we use a ref.
  const submitIntentRef = useRef<'draft' | 'submit'>('draft');
  const [loadingIntent, setLoadingIntent] = useState<'draft' | 'submit' | null>(null);

  // Incident state
  const [incidentMode, setIncidentMode] = useState<'search' | 'new'>('search');
  const [incidentSearch, setIncidentSearch] = useState('');
  const [incidentResults, setIncidentResults] = useState<Incident[]>([]);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(
    record?.incident
      ? ({
          id: record.incident.id,
          name: record.incident.name,
          incident_type: record.incident.type,
          location_state: record.incident.state,
          incident_start_date: record.incident.startDate,
          slug: '',
          incident_subtype: null,
          incident_end_date: record.incident.endDate,
          location_county: null,
          fema_disaster_number: record.incident.femaDisasterNumber,
          verification_status: 'unverified',
          status: 'active',
          deployment_count: 0,
          responder_count: 0,
        } as Incident)
      : null
  );

  // Position state
  const [positionMode, setPositionMode] = useState<'rtlt' | 'freetext'>(
    record?.positionFreeText ? 'freetext' : 'rtlt'
  );
  const [positionSearch, setPositionSearch] = useState('');
  const [positionCategory, setPositionCategory] = useState('');
  const [positionResults, setPositionResults] = useState<Position[]>([]);
  const [selectedPosition, setSelectedPosition] = useState<Position | null>(
    record?.position
      ? ({
          id: record.position.id,
          title: record.position.title,
          nims_type: record.position.nimsType,
          resource_category: record.position.resourceCategory,
        } as Position)
      : null
  );
  const [freeText, setFreeText] = useState(record?.positionFreeText ?? '');

  // Dates and auto-calculated total days
  const [startDate, setStartDate] = useState(record?.startDate ?? '');
  const [endDate, setEndDate] = useState(record?.endDate ?? '');
  const [totalDaysTouched, setTotalDaysTouched] = useState<boolean>(
    record?.totalDays != null
  );
  const [totalDays, setTotalDays] = useState<string>(
    record?.totalDays != null ? String(record.totalDays) : ''
  );

  // Operational setting
  const [operationalSetting, setOperationalSetting] = useState<OperationalSetting | ''>(
    record?.operationalSetting ?? ''
  );
  const [operationalSettingOther, setOperationalSettingOther] = useState(
    record?.operationalSettingOther ?? ''
  );

  // Compensation
  const [compensationStatus, setCompensationStatus] = useState<CompensationStatus | ''>(
    record?.compensationStatus ?? ''
  );
  const [compensationStatusOther, setCompensationStatusOther] = useState(
    record?.compensationStatusOther ?? ''
  );

  // Self-certification
  const [certified, setCertified] = useState(false);

  // Auto-calc total_days when dates change (only if user hasn't manually edited)
  const autoTotalDays = useMemo(() => computeTotalDays(startDate, endDate || null), [startDate, endDate]);
  const displayTotalDays = totalDaysTouched
    ? totalDays
    : autoTotalDays != null
      ? String(autoTotalDays)
      : '';

  async function handleIncidentSearch(q: string) {
    setIncidentSearch(q);
    if (q.length < 2) {
      setIncidentResults([]);
      return;
    }
    const results = await searchIncidents(supabase, q);
    setIncidentResults(results);
  }

  async function handlePositionSearch(q: string) {
    setPositionSearch(q);
    if (q.length < 2) {
      setPositionResults([]);
      return;
    }
    const results = await searchPositions(supabase, q, positionCategory || undefined);
    setPositionResults(results);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const intent = submitIntentRef.current;
    if (intent === 'submit' && !certified) {
      setError('Please certify the information before submitting.');
      return;
    }

    setLoading(true);
    setLoadingIntent(intent);
    const form = new FormData(e.currentTarget);

    // Position
    if (positionMode === 'rtlt' && selectedPosition) {
      form.set('positionId', selectedPosition.id);
      form.delete('positionFreeText');
    } else if (positionMode === 'freetext') {
      form.delete('positionId');
      form.set('positionFreeText', freeText);
    } else {
      form.delete('positionId');
      form.delete('positionFreeText');
    }

    // Incident
    if (incidentMode === 'search' && selectedIncident) {
      form.set('incidentId', selectedIncident.id);
      form.delete('incidentName');
      form.delete('incidentType');
      form.delete('incidentState');
      form.delete('incidentStartDate');
    } else if (incidentMode === 'new') {
      form.delete('incidentId');
    } else {
      form.delete('incidentId');
      form.delete('incidentName');
      form.delete('incidentType');
      form.delete('incidentState');
      form.delete('incidentStartDate');
    }

    // Use auto-computed totalDays when user didn't override
    if (!totalDaysTouched && autoTotalDays != null) {
      form.set('totalDays', String(autoTotalDays));
    }

    // Operational setting
    if (operationalSetting) form.set('operationalSetting', operationalSetting);
    else form.delete('operationalSetting');
    if (operationalSetting !== 'other') form.delete('operationalSettingOther');

    // Compensation
    if (compensationStatus) form.set('compensationStatus', compensationStatus);
    else form.delete('compensationStatus');
    if (compensationStatus !== 'other') form.delete('compensationStatusOther');

    // Certify + submit flag (only when intent is submit)
    if (intent === 'submit') {
      form.set('certifyAndSubmit', 'true');
    } else {
      form.delete('certifyAndSubmit');
    }

    let result;
    if (isEdit && record) {
      result = await updateDeploymentAction(record.id, form);
    } else {
      result = await createDeploymentAction(form);
    }

    if (result?.error) {
      setError(result.error);
      setLoading(false);
      setLoadingIntent(null);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div
          role="alert"
          className="bg-red-50 border border-red-200 text-[var(--gs-alert)] rounded p-3 text-sm"
        >
          {error}
        </div>
      )}

      {/* Section 1 — Incident Information (Blocks 1-2, 7, 10-12) */}
      <section className={sectionClass} aria-labelledby="section-incident">
        <header className="mb-4">
          <h3 id="section-incident" className={sectionTitle}>
            Incident Information
            <span className={blockBadge}>ICS 222 Blocks 1–2, 7, 10–12</span>
          </h3>
          <p className={sectionSubtitle}>
            Optional. Link this report to a registered incident, or create one inline.
          </p>
        </header>

        <div className="flex items-center gap-3 mb-4">
          <button
            type="button"
            onClick={() => {
              setIncidentMode('search');
            }}
            className={`text-sm px-3 py-1 rounded ${
              incidentMode === 'search'
                ? 'bg-[var(--gs-navy)] text-white'
                : 'bg-[var(--gs-cloud)]/50 text-[var(--gs-steel)]'
            }`}
          >
            Search Existing
          </button>
          <button
            type="button"
            onClick={() => {
              setIncidentMode('new');
              setSelectedIncident(null);
            }}
            className={`text-sm px-3 py-1 rounded ${
              incidentMode === 'new'
                ? 'bg-[var(--gs-navy)] text-white'
                : 'bg-[var(--gs-cloud)]/50 text-[var(--gs-steel)]'
            }`}
          >
            Create New
          </button>
        </div>

        {incidentMode === 'search' ? (
          <div>
            <input
              type="text"
              value={incidentSearch}
              onChange={(e) => handleIncidentSearch(e.target.value)}
              placeholder="Search incidents by name..."
              className={inputClass}
              aria-label="Search incidents"
            />
            {selectedIncident && (
              <div className="mt-3 bg-[var(--gs-gold)]/10 border border-[var(--gs-gold)]/30 rounded-md p-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="font-medium text-[var(--gs-navy)]">
                      {selectedIncident.name}
                    </div>
                    <dl className="mt-1.5 grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-[var(--gs-steel)]">
                      <div>
                        <dt className="inline font-medium">Type: </dt>
                        <dd className="inline">{selectedIncident.incident_type}</dd>
                      </div>
                      {selectedIncident.location_state && (
                        <div>
                          <dt className="inline font-medium">Location: </dt>
                          <dd className="inline">{selectedIncident.location_state}</dd>
                        </div>
                      )}
                      <div>
                        <dt className="inline font-medium">Start: </dt>
                        <dd className="inline">
                          {selectedIncident.incident_start_date ?? '—'}
                        </dd>
                      </div>
                      {selectedIncident.incident_end_date && (
                        <div>
                          <dt className="inline font-medium">End: </dt>
                          <dd className="inline">{selectedIncident.incident_end_date}</dd>
                        </div>
                      )}
                      {selectedIncident.fema_disaster_number && (
                        <div className="col-span-2">
                          <dt className="inline font-medium">FEMA Disaster #: </dt>
                          <dd className="inline">{selectedIncident.fema_disaster_number}</dd>
                        </div>
                      )}
                    </dl>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedIncident(null)}
                    className="text-xs text-[var(--gs-steel)] hover:text-[var(--gs-alert)] shrink-0"
                  >
                    Remove
                  </button>
                </div>
              </div>
            )}
            {incidentResults.length > 0 && !selectedIncident && (
              <div className="border border-[var(--gs-cloud)] rounded mt-2 max-h-48 overflow-y-auto">
                {incidentResults.map((inc) => (
                  <button
                    key={inc.id}
                    type="button"
                    onClick={() => {
                      setSelectedIncident(inc);
                      setIncidentResults([]);
                      setIncidentSearch('');
                    }}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-[var(--gs-white)] border-b border-[var(--gs-cloud)] last:border-0"
                  >
                    <span className="font-medium text-[var(--gs-navy)]">{inc.name}</span>
                    <span className="text-xs text-[var(--gs-steel)] ml-2">
                      {inc.incident_type}
                      {inc.location_state ? ` – ${inc.location_state}` : ''}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label htmlFor="incidentName" className={labelClass}>
                Incident name
              </label>
              <input
                id="incidentName"
                name="incidentName"
                type="text"
                className={inputClass}
                maxLength={200}
              />
            </div>
            <div>
              <label htmlFor="incidentType" className={labelClass}>
                Incident type
              </label>
              <select id="incidentType" name="incidentType" className={inputClass}>
                <option value="disaster">Disaster</option>
                <option value="exercise">Exercise</option>
                <option value="planned_event">Planned Event</option>
                <option value="training">Training</option>
                <option value="steady_state">Steady State</option>
              </select>
            </div>
            <div>
              <label htmlFor="incidentState" className={labelClass}>
                State
              </label>
              <input
                id="incidentState"
                name="incidentState"
                type="text"
                className={inputClass}
                maxLength={50}
              />
            </div>
            <div>
              <label htmlFor="incidentStartDate" className={labelClass}>
                Incident start date
              </label>
              <input
                id="incidentStartDate"
                name="incidentStartDate"
                type="date"
                className={inputClass}
              />
            </div>
          </div>
        )}
      </section>

      {/* Section 2 — Your Assignment (Blocks 5-6, 8-9) */}
      <section className={sectionClass} aria-labelledby="section-assignment">
        <header className="mb-4">
          <h3 id="section-assignment" className={sectionTitle}>
            Your Assignment
            <span className={blockBadge}>ICS 222 Blocks 5–6, 8–9</span>
          </h3>
          <p className={sectionSubtitle}>
            Position, home organization, operational setting, and dates of service.
          </p>
        </header>

        {/* Position */}
        <div className="mb-5">
          <div className={labelClass}>Position Held</div>
          <div className="flex items-center gap-3 mb-3">
            <button
              type="button"
              onClick={() => setPositionMode('rtlt')}
              className={`text-sm px-3 py-1 rounded ${
                positionMode === 'rtlt'
                  ? 'bg-[var(--gs-navy)] text-white'
                  : 'bg-[var(--gs-cloud)]/50 text-[var(--gs-steel)]'
              }`}
            >
              RTLT Position
            </button>
            <button
              type="button"
              onClick={() => setPositionMode('freetext')}
              className={`text-sm px-3 py-1 rounded ${
                positionMode === 'freetext'
                  ? 'bg-[var(--gs-navy)] text-white'
                  : 'bg-[var(--gs-cloud)]/50 text-[var(--gs-steel)]'
              }`}
            >
              Other Position
            </button>
          </div>

          {positionMode === 'rtlt' ? (
            <div>
              <div className="flex gap-2 mb-2">
                <select
                  value={positionCategory}
                  onChange={(e) => setPositionCategory(e.target.value)}
                  className={`${inputClass} max-w-[220px]`}
                  aria-label="Position category filter"
                >
                  <option value="">All categories</option>
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  value={positionSearch}
                  onChange={(e) => handlePositionSearch(e.target.value)}
                  placeholder="Search RTLT positions..."
                  className={inputClass}
                  aria-label="Search RTLT positions"
                />
              </div>
              {selectedPosition && (
                <div className="flex items-center gap-2 p-2 bg-[var(--gs-gold)]/10 rounded mb-2">
                  <span className="text-sm font-medium text-[var(--gs-navy)]">
                    {selectedPosition.title}
                  </span>
                  {selectedPosition.resource_category && (
                    <span className="text-xs text-[var(--gs-steel)]">
                      {selectedPosition.resource_category}
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => setSelectedPosition(null)}
                    className="ml-auto text-xs text-[var(--gs-steel)] hover:text-[var(--gs-alert)]"
                  >
                    Remove
                  </button>
                </div>
              )}
              {positionResults.length > 0 && !selectedPosition && (
                <div className="border border-[var(--gs-cloud)] rounded max-h-48 overflow-y-auto">
                  {positionResults.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => {
                        setSelectedPosition(p);
                        setPositionResults([]);
                        setPositionSearch('');
                      }}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-[var(--gs-white)] border-b border-[var(--gs-cloud)] last:border-0"
                    >
                      <span className="font-medium text-[var(--gs-navy)]">{p.title}</span>
                      {p.resource_category && (
                        <span className="text-xs text-[var(--gs-steel)] ml-2">
                          {p.resource_category}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div>
              <input
                id="positionFreeText"
                type="text"
                value={freeText}
                onChange={(e) => setFreeText(e.target.value)}
                placeholder="Enter position title"
                className={inputClass}
                maxLength={200}
                aria-label="Position title"
              />
            </div>
          )}
        </div>

        {/* Organization */}
        <div className="mb-5">
          <label htmlFor="orgId" className={labelClass}>
            Home Agency / Organization
          </label>
          <select
            id="orgId"
            name="orgId"
            defaultValue={record?.orgId ?? ''}
            className={inputClass}
          >
            <option value="">None</option>
            {userOrgs.map((org) => (
              <option key={org.id} value={org.id}>
                {org.name}
              </option>
            ))}
          </select>
        </div>

        {/* Operational Setting */}
        <fieldset className="mb-5">
          <legend className={labelClass}>Operational Setting</legend>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {OPERATIONAL_SETTINGS.map((opt) => (
              <label
                key={opt.value}
                className={`flex items-start gap-2 rounded border px-3 py-2 text-sm cursor-pointer transition-colors ${
                  operationalSetting === opt.value
                    ? 'border-[var(--gs-gold)] bg-[var(--gs-gold)]/10'
                    : 'border-[var(--gs-cloud)] hover:bg-[var(--gs-white)]'
                }`}
              >
                <input
                  type="radio"
                  name="operationalSetting"
                  value={opt.value}
                  checked={operationalSetting === opt.value}
                  onChange={() => setOperationalSetting(opt.value)}
                  className="mt-0.5"
                />
                <span>
                  <span className="font-medium text-[var(--gs-navy)] block">{opt.label}</span>
                  <span className="text-xs text-[var(--gs-steel)]">{opt.hint}</span>
                </span>
              </label>
            ))}
          </div>
          {operationalSetting === 'other' && (
            <div className="mt-3">
              <label htmlFor="operationalSettingOther" className={labelClass}>
                Describe operational setting
              </label>
              <input
                id="operationalSettingOther"
                name="operationalSettingOther"
                type="text"
                value={operationalSettingOther}
                onChange={(e) => setOperationalSettingOther(e.target.value)}
                className={inputClass}
                maxLength={200}
              />
            </div>
          )}
        </fieldset>

        {/* Dates and durations */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="startDate" className={labelClass}>
              Start date *
            </label>
            <input
              id="startDate"
              name="startDate"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              required
              max={today}
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="endDate" className={labelClass}>
              End date
            </label>
            <input
              id="endDate"
              name="endDate"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              max={today}
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="totalDays" className={labelClass}>
              Total days
              <span className="ml-1 text-xs font-normal text-[var(--gs-steel)]">
                (auto-calculated, override if needed)
              </span>
            </label>
            <input
              id="totalDays"
              name="totalDays"
              type="number"
              min={1}
              max={365}
              value={displayTotalDays}
              onChange={(e) => {
                setTotalDaysTouched(true);
                setTotalDays(e.target.value);
              }}
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="operationalPeriods" className={labelClass}>
              Operational periods
            </label>
            <input
              id="operationalPeriods"
              name="operationalPeriods"
              type="number"
              min={1}
              max={999}
              defaultValue={record?.operationalPeriods ?? ''}
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="hours" className={labelClass}>
              Hours served
            </label>
            <input
              id="hours"
              name="hours"
              type="number"
              min={1}
              max={8760}
              defaultValue={record?.hours ?? ''}
              className={inputClass}
            />
          </div>
        </div>
      </section>

      {/* Section 3 — Compensation (Block 13) */}
      <section className={sectionClass} aria-labelledby="section-compensation">
        <header className="mb-4">
          <h3 id="section-compensation" className={sectionTitle}>
            Compensation
            <span className={blockBadge}>ICS 222 Block 13</span>
          </h3>
          <p className={sectionSubtitle}>
            How was this service compensated?
          </p>
        </header>

        <fieldset>
          <legend className="sr-only">Compensation status</legend>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {COMPENSATION_STATUSES.map((opt) => (
              <label
                key={opt.value}
                className={`flex items-start gap-2 rounded border px-3 py-2 text-sm cursor-pointer transition-colors ${
                  compensationStatus === opt.value
                    ? 'border-[var(--gs-gold)] bg-[var(--gs-gold)]/10'
                    : 'border-[var(--gs-cloud)] hover:bg-[var(--gs-white)]'
                }`}
              >
                <input
                  type="radio"
                  name="compensationStatus"
                  value={opt.value}
                  checked={compensationStatus === opt.value}
                  onChange={() => setCompensationStatus(opt.value)}
                  className="mt-0.5"
                />
                <span>
                  <span className="font-medium text-[var(--gs-navy)] block">{opt.label}</span>
                  <span className="text-xs text-[var(--gs-steel)]">{opt.hint}</span>
                </span>
              </label>
            ))}
          </div>
          {compensationStatus === 'other' && (
            <div className="mt-3">
              <label htmlFor="compensationStatusOther" className={labelClass}>
                Describe compensation status
              </label>
              <input
                id="compensationStatusOther"
                name="compensationStatusOther"
                type="text"
                value={compensationStatusOther}
                onChange={(e) => setCompensationStatusOther(e.target.value)}
                className={inputClass}
                maxLength={200}
              />
            </div>
          )}
        </fieldset>
      </section>

      {/* Section 4 — What You Did (Blocks 14-16) */}
      <section className={sectionClass} aria-labelledby="section-what-you-did">
        <header className="mb-4">
          <h3 id="section-what-you-did" className={sectionTitle}>
            What You Did
            <span className={blockBadge}>ICS 222 Blocks 14–16</span>
          </h3>
          <p className={sectionSubtitle}>
            Narrative of your duties, accomplishments, and resources managed.
          </p>
        </header>

        <div className="space-y-5">
          <div>
            <label htmlFor="dutiesSummary" className={labelClass}>
              Summary of Duties and Responsibilities
            </label>
            <textarea
              id="dutiesSummary"
              name="dutiesSummary"
              rows={5}
              defaultValue={record?.dutiesSummary ?? ''}
              placeholder="Describe duties performed, scope of authority, reporting relationships, and key functions."
              className={inputClass}
              maxLength={5000}
            />
          </div>
          <div>
            <label htmlFor="keyAccomplishments" className={labelClass}>
              Key Accomplishments and Activities
            </label>
            <textarea
              id="keyAccomplishments"
              name="keyAccomplishments"
              rows={5}
              defaultValue={record?.keyAccomplishments ?? ''}
              placeholder="Describe significant accomplishments, outcomes, and contributions to incident objectives."
              className={inputClass}
              maxLength={5000}
            />
          </div>
          <div>
            <div className={labelClass}>Resources Managed</div>
            <p className="text-xs text-[var(--gs-steel)] mb-2">
              Range of personnel and equipment under your supervision.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="personnelSupervised" className={labelClass}>
                  Personnel Supervised
                </label>
                <input
                  id="personnelSupervised"
                  name="personnelSupervised"
                  type="text"
                  defaultValue={record?.personnelSupervised ?? ''}
                  placeholder="e.g., 12–15 personnel across 3 divisions"
                  className={inputClass}
                  maxLength={500}
                />
              </div>
              <div>
                <label htmlFor="equipmentSupervised" className={labelClass}>
                  Equipment Supervised
                </label>
                <input
                  id="equipmentSupervised"
                  name="equipmentSupervised"
                  type="text"
                  defaultValue={record?.equipmentSupervised ?? ''}
                  placeholder="e.g., 5 vehicles, 2 generators, communications equipment"
                  className={inputClass}
                  maxLength={500}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 5 — Supervisor / Point of Contact (Block 19) */}
      <section className={sectionClass} aria-labelledby="section-supervisor">
        <header className="mb-4">
          <h3 id="section-supervisor" className={sectionTitle}>
            Supervisor / Point of Contact
            <span className={blockBadge}>ICS 222 Block 19</span>
          </h3>
          <p className={sectionSubtitle}>Optional. Used for verification requests.</p>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="supervisorName" className={labelClass}>
              Name
            </label>
            <input
              id="supervisorName"
              name="supervisorName"
              type="text"
              defaultValue={record?.supervisorName ?? ''}
              className={inputClass}
              maxLength={200}
            />
          </div>
          <div>
            <label htmlFor="supervisorEmail" className={labelClass}>
              Email
            </label>
            <input
              id="supervisorEmail"
              name="supervisorEmail"
              type="email"
              defaultValue={record?.supervisorEmail ?? ''}
              className={inputClass}
            />
          </div>
        </div>
      </section>

      {/* Section 6 — Remarks (Block 17) */}
      <section className={sectionClass} aria-labelledby="section-remarks">
        <header className="mb-4">
          <h3 id="section-remarks" className={sectionTitle}>
            Remarks
            <span className={blockBadge}>ICS 222 Block 17</span>
          </h3>
        </header>
        <textarea
          id="notes"
          name="notes"
          aria-label="Remarks"
          rows={3}
          defaultValue={record?.notes ?? ''}
          placeholder="Any additional information relevant to this deployment record."
          className={inputClass}
          maxLength={2000}
        />
      </section>

      {/* Section 7 — Self-Certification (Block 18) */}
      <section className={sectionClass} aria-labelledby="section-certification">
        <header className="mb-4">
          <h3 id="section-certification" className={sectionTitle}>
            Self-Certification
            <span className={blockBadge}>ICS 222 Block 18</span>
          </h3>
          <p className={sectionSubtitle}>
            Required to submit. Not required to save as draft.
          </p>
        </header>

        <label className="flex items-start gap-3 text-sm text-[var(--gs-navy)] cursor-pointer">
          <input
            type="checkbox"
            checked={certified}
            onChange={(e) => setCertified(e.target.checked)}
            className="mt-0.5 w-4 h-4 accent-[var(--gs-gold)]"
          />
          <span>
            I certify that the information in this report is accurate and complete to the best of
            my knowledge.
          </span>
        </label>
      </section>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:justify-between">
        <div className="flex gap-3">
          <button
            type="submit"
            onClick={() => {
              submitIntentRef.current = 'draft';
            }}
            disabled={loading}
            className="border border-[var(--gs-navy)] text-[var(--gs-navy)] hover:bg-[var(--gs-navy)]/5 px-6 py-2.5 rounded-md text-sm font-medium disabled:opacity-50 transition-colors"
          >
            {loadingIntent === 'draft' ? 'Saving…' : 'Save as Draft'}
          </button>
          <button
            type="button"
            onClick={() => router.push('/dashboard/records')}
            className="text-[var(--gs-steel)] hover:text-[var(--gs-navy)] px-4 py-2.5 text-sm font-medium transition-colors"
          >
            Cancel
          </button>
        </div>
        <button
          type="submit"
          onClick={() => {
            submitIntentRef.current = 'submit';
          }}
          disabled={loading || !certified}
          title={!certified ? 'Check the self-certification to submit.' : undefined}
          className="bg-[var(--gs-navy)] text-white hover:opacity-90 px-6 py-2.5 rounded-md text-sm font-medium disabled:opacity-50 transition-opacity"
        >
          {loadingIntent === 'submit' ? 'Submitting…' : 'Submit Response Report'}
        </button>
      </div>
    </form>
  );
}
