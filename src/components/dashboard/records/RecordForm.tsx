'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { searchIncidents } from '@/lib/queries/incidents';
import { searchPositions } from '@/lib/queries/positions-search';
import { createDeploymentAction, updateDeploymentAction } from '@/lib/actions/deployments';
import type { Position } from '@/lib/types/deployments';
import type { IncidentSummary as Incident } from '@/lib/types/incidents';
import type { DeploymentRecordDetail } from '@/lib/types/deployment-views';

const inputClass =
  'w-full rounded-md border border-[var(--gs-cloud)] px-3 py-2 text-sm text-[var(--gs-navy)] focus:border-[var(--gs-gold)] focus:ring-1 focus:ring-[var(--gs-gold)] focus:outline-none';
const labelClass = 'block text-sm font-medium text-[var(--gs-steel)] mb-1';

interface Props {
  record?: DeploymentRecordDetail;
  categories: string[];
  userOrgs: { id: string; name: string }[];
}

export function RecordForm({ record, categories, userOrgs }: Props) {
  const router = useRouter();
  const supabase = createClient();
  const isEdit = !!record;

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Incident state
  const [incidentMode, setIncidentMode] = useState<'search' | 'new'>(
    record?.incident ? 'search' : 'search'
  );
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

  async function handleIncidentSearch(q: string) {
    setIncidentSearch(q);
    if (q.length < 2) { setIncidentResults([]); return; }
    const results = await searchIncidents(supabase, q);
    setIncidentResults(results);
  }

  async function handlePositionSearch(q: string) {
    setPositionSearch(q);
    if (q.length < 2) { setPositionResults([]); return; }
    const results = await searchPositions(supabase, q, positionCategory || undefined);
    setPositionResults(results);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const form = new FormData(e.currentTarget);

    // Set position fields
    if (positionMode === 'rtlt' && selectedPosition) {
      form.set('positionId', selectedPosition.id);
      form.delete('positionFreeText');
    } else if (positionMode === 'freetext') {
      form.delete('positionId');
      form.set('positionFreeText', freeText);
    }

    // Set incident fields
    if (selectedIncident) {
      form.set('incidentId', selectedIncident.id);
    } else if (incidentMode === 'new') {
      form.delete('incidentId');
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
    }
    // createDeploymentAction redirects on success
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-[var(--gs-alert)] rounded p-3 text-sm">
          {error}
        </div>
      )}

      {/* Position */}
      <div className="bg-white rounded-lg shadow-sm border border-[var(--gs-cloud)] p-6">
        <h3 className="text-lg font-semibold text-[var(--gs-navy)] mb-4">Position</h3>
        <div className="flex items-center gap-3 mb-4">
          <button
            type="button"
            onClick={() => setPositionMode('rtlt')}
            className={`text-sm px-3 py-1 rounded ${positionMode === 'rtlt' ? 'bg-[var(--gs-navy)] text-white' : 'bg-[var(--gs-cloud)]/50 text-[var(--gs-steel)]'}`}
          >
            RTLT Position
          </button>
          <button
            type="button"
            onClick={() => setPositionMode('freetext')}
            className={`text-sm px-3 py-1 rounded ${positionMode === 'freetext' ? 'bg-[var(--gs-navy)] text-white' : 'bg-[var(--gs-cloud)]/50 text-[var(--gs-steel)]'}`}
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
                className={`${inputClass} max-w-[200px]`}
              >
                <option value="">All categories</option>
                {categories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              <input
                type="text"
                value={positionSearch}
                onChange={(e) => handlePositionSearch(e.target.value)}
                placeholder="Search RTLT positions..."
                className={inputClass}
              />
            </div>
            {selectedPosition && (
              <div className="flex items-center gap-2 p-2 bg-[var(--gs-gold)]/10 rounded mb-2">
                <span className="text-sm font-medium text-[var(--gs-navy)]">
                  {selectedPosition.title}
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedPosition(null)}
                  className="text-xs text-[var(--gs-steel)] hover:text-[var(--gs-alert)]"
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
                    onClick={() => { setSelectedPosition(p); setPositionResults([]); setPositionSearch(''); }}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-[var(--gs-white)] border-b border-[var(--gs-cloud)] last:border-0"
                  >
                    <span className="font-medium text-[var(--gs-navy)]">{p.title}</span>
                    {p.resource_category && (
                      <span className="text-xs text-[var(--gs-steel)] ml-2">{p.resource_category}</span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div>
            <label htmlFor="positionFreeText" className={labelClass}>Position title</label>
            <input
              id="positionFreeText"
              type="text"
              value={freeText}
              onChange={(e) => setFreeText(e.target.value)}
              placeholder="Enter position title"
              className={inputClass}
              maxLength={200}
            />
          </div>
        )}
      </div>

      {/* Incident */}
      <div className="bg-white rounded-lg shadow-sm border border-[var(--gs-cloud)] p-6">
        <h3 className="text-lg font-semibold text-[var(--gs-navy)] mb-4">Incident</h3>
        <div className="flex items-center gap-3 mb-4">
          <button
            type="button"
            onClick={() => { setIncidentMode('search'); setSelectedIncident(null); }}
            className={`text-sm px-3 py-1 rounded ${incidentMode === 'search' ? 'bg-[var(--gs-navy)] text-white' : 'bg-[var(--gs-cloud)]/50 text-[var(--gs-steel)]'}`}
          >
            Search Existing
          </button>
          <button
            type="button"
            onClick={() => { setIncidentMode('new'); setSelectedIncident(null); }}
            className={`text-sm px-3 py-1 rounded ${incidentMode === 'new' ? 'bg-[var(--gs-navy)] text-white' : 'bg-[var(--gs-cloud)]/50 text-[var(--gs-steel)]'}`}
          >
            New Incident
          </button>
        </div>
        <p className="text-xs text-[var(--gs-steel)] mb-3">
          Optional. You can record a deployment without linking it to a specific incident.
        </p>

        {incidentMode === 'search' ? (
          <div>
            <input
              type="text"
              value={incidentSearch}
              onChange={(e) => handleIncidentSearch(e.target.value)}
              placeholder="Search incidents by name..."
              className={inputClass}
            />
            {selectedIncident && (
              <div className="flex items-center gap-2 p-2 bg-[var(--gs-gold)]/10 rounded mt-2">
                <span className="text-sm font-medium text-[var(--gs-navy)]">
                  {selectedIncident.name}
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedIncident(null)}
                  className="text-xs text-[var(--gs-steel)] hover:text-[var(--gs-alert)]"
                >
                  Remove
                </button>
              </div>
            )}
            {incidentResults.length > 0 && !selectedIncident && (
              <div className="border border-[var(--gs-cloud)] rounded mt-2 max-h-48 overflow-y-auto">
                {incidentResults.map((inc) => (
                  <button
                    key={inc.id}
                    type="button"
                    onClick={() => { setSelectedIncident(inc); setIncidentResults([]); setIncidentSearch(''); }}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-[var(--gs-white)] border-b border-[var(--gs-cloud)] last:border-0"
                  >
                    <span className="font-medium text-[var(--gs-navy)]">{inc.name}</span>
                    <span className="text-xs text-[var(--gs-steel)] ml-2">
                      {inc.incident_type} {inc.location_state ? `\u2013 ${inc.location_state}` : ''}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label htmlFor="incidentName" className={labelClass}>Incident name</label>
              <input id="incidentName" name="incidentName" type="text" className={inputClass} maxLength={200} />
            </div>
            <div>
              <label htmlFor="incidentType" className={labelClass}>Incident type</label>
              <select id="incidentType" name="incidentType" className={inputClass}>
                <option value="disaster">Disaster</option>
                <option value="exercise">Exercise</option>
                <option value="planned_event">Planned Event</option>
                <option value="training">Training</option>
                <option value="steady_state">Steady State</option>
              </select>
            </div>
            <div>
              <label htmlFor="incidentState" className={labelClass}>State</label>
              <input id="incidentState" name="incidentState" type="text" className={inputClass} maxLength={50} />
            </div>
            <div>
              <label htmlFor="incidentStartDate" className={labelClass}>Incident start date</label>
              <input id="incidentStartDate" name="incidentStartDate" type="date" className={inputClass} />
            </div>
          </div>
        )}
      </div>

      {/* Deployment Details */}
      <div className="bg-white rounded-lg shadow-sm border border-[var(--gs-cloud)] p-6">
        <h3 className="text-lg font-semibold text-[var(--gs-navy)] mb-4">Deployment Details</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="startDate" className={labelClass}>Start date *</label>
            <input
              id="startDate"
              name="startDate"
              type="date"
              defaultValue={record?.startDate ?? ''}
              required
              max={new Date().toISOString().split('T')[0]}
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="endDate" className={labelClass}>End date</label>
            <input
              id="endDate"
              name="endDate"
              type="date"
              defaultValue={record?.endDate ?? ''}
              max={new Date().toISOString().split('T')[0]}
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="hours" className={labelClass}>Hours</label>
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
          <div>
            <label htmlFor="orgId" className={labelClass}>Organization</label>
            <select id="orgId" name="orgId" defaultValue={record?.orgId ?? ''} className={inputClass}>
              <option value="">None</option>
              {userOrgs.map((org) => (
                <option key={org.id} value={org.id}>{org.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Supervisor */}
      <div className="bg-white rounded-lg shadow-sm border border-[var(--gs-cloud)] p-6">
        <h3 className="text-lg font-semibold text-[var(--gs-navy)] mb-1">
          Supervisor / Point of Contact
        </h3>
        <p className="text-sm text-[var(--gs-steel)] mb-4">
          Optional. Used for verification requests.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="supervisorName" className={labelClass}>Name</label>
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
            <label htmlFor="supervisorEmail" className={labelClass}>Email</label>
            <input
              id="supervisorEmail"
              name="supervisorEmail"
              type="email"
              defaultValue={record?.supervisorEmail ?? ''}
              className={inputClass}
            />
          </div>
        </div>
      </div>

      {/* Notes */}
      <div className="bg-white rounded-lg shadow-sm border border-[var(--gs-cloud)] p-6">
        <h3 className="text-lg font-semibold text-[var(--gs-navy)] mb-1">Additional Context</h3>
        <textarea
          id="notes"
          name="notes"
          aria-label="Additional context"
          rows={3}
          defaultValue={record?.notes ?? ''}
          placeholder="Anything else relevant to this deployment — conditions, challenges, outcomes."
          className={inputClass}
          maxLength={2000}
        />
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={loading}
          className="bg-[var(--gs-navy)] text-white hover:opacity-90 px-6 py-2.5 rounded-md text-sm font-medium disabled:opacity-50 transition-opacity"
        >
          {loading ? 'Saving...' : isEdit ? 'Save Changes' : 'Save as Draft'}
        </button>
        <button
          type="button"
          onClick={() => router.push('/dashboard/records')}
          className="border border-[var(--gs-cloud)] text-[var(--gs-steel)] hover:bg-[var(--gs-white)] px-6 py-2.5 rounded-md text-sm font-medium transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
