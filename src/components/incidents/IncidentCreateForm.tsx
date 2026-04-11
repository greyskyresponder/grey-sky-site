// TODO: Add tests — form renders required fields, optional section toggle, submit calls action, error display, pending state
'use client';

import { useActionState, useState } from 'react';
import { createIncidentAction } from '@/lib/actions/incidents';
import { ChevronDown, ChevronUp } from 'lucide-react';

const US_STATES = [
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA','KS',
  'KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY',
  'NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT','VA','WA','WV',
  'WI','WY','DC','PR','VI','GU','AS','MP',
];

const INCIDENT_TYPES = [
  { value: 'natural_disaster', label: 'Natural Disaster' },
  { value: 'technological', label: 'Technological' },
  { value: 'human_caused', label: 'Human-Caused' },
  { value: 'biological', label: 'Biological' },
  { value: 'planned_event', label: 'Planned Event' },
  { value: 'exercise', label: 'Exercise' },
  { value: 'training', label: 'Training' },
  { value: 'steady_state', label: 'Steady State' },
];

const inputClass = 'w-full rounded-md border border-[var(--gs-cloud)] px-3 py-2 text-sm text-[var(--gs-navy)] focus:border-[var(--gs-gold)] focus:outline-none focus:ring-1 focus:ring-[var(--gs-gold)]';
const labelClass = 'block text-sm font-medium text-[var(--gs-steel)] mb-1';

export default function IncidentCreateForm() {
  const [state, formAction, isPending] = useActionState(createIncidentAction, { error: null });
  const [showOptional, setShowOptional] = useState(false);

  return (
    <form action={formAction} className="space-y-6 max-w-xl">
      {state.error && (
        <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
          {state.error}
        </div>
      )}

      {/* Required Fields */}
      <div className="space-y-4">
        <div>
          <label htmlFor="name" className={labelClass}>
            Incident Name <span className="text-red-500">*</span>
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            minLength={3}
            maxLength={255}
            placeholder='e.g., "Hurricane Milton" or "2024 Orlando Flooding"'
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor="incident_type" className={labelClass}>
            Incident Type <span className="text-red-500">*</span>
          </label>
          <select id="incident_type" name="incident_type" required className={inputClass}>
            <option value="">Select type...</option>
            {INCIDENT_TYPES.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="incident_start_date" className={labelClass}>
            Start Date <span className="text-red-500">*</span>
          </label>
          <input
            id="incident_start_date"
            name="incident_start_date"
            type="date"
            required
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor="location_state" className={labelClass}>
            State <span className="text-red-500">*</span>
          </label>
          <select id="location_state" name="location_state" required className={inputClass}>
            <option value="">Select state...</option>
            {US_STATES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Optional Fields Toggle */}
      <button
        type="button"
        onClick={() => setShowOptional(!showOptional)}
        className="flex items-center gap-2 text-sm text-[var(--gs-steel)] hover:text-[var(--gs-navy)] transition-colors"
      >
        {showOptional ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        {showOptional ? 'Hide' : 'Show'} additional details
      </button>

      {/* Optional Fields */}
      {showOptional && (
        <div className="space-y-4 p-4 border border-[var(--gs-cloud)] rounded-lg bg-[var(--gs-white)]/50">
          <div>
            <label htmlFor="incident_subtype" className={labelClass}>Subtype</label>
            <input
              id="incident_subtype"
              name="incident_subtype"
              type="text"
              maxLength={100}
              placeholder='e.g., "Hurricane", "Wildfire", "HazMat Release"'
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="incident_end_date" className={labelClass}>End Date</label>
            <input id="incident_end_date" name="incident_end_date" type="date" className={inputClass} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="location_county" className={labelClass}>County</label>
              <input id="location_county" name="location_county" type="text" maxLength={100} className={inputClass} />
            </div>
            <div>
              <label htmlFor="location_city" className={labelClass}>City</label>
              <input id="location_city" name="location_city" type="text" maxLength={100} className={inputClass} />
            </div>
          </div>

          <div>
            <label htmlFor="description" className={labelClass}>Brief Description</label>
            <textarea
              id="description"
              name="description"
              maxLength={2000}
              rows={3}
              placeholder="What happened? Brief factual summary."
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="fema_disaster_number" className={labelClass}>FEMA Disaster Number</label>
            <input
              id="fema_disaster_number"
              name="fema_disaster_number"
              type="text"
              maxLength={10}
              placeholder='e.g., "4834"'
              className={inputClass}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="location_latitude" className={labelClass}>Latitude</label>
              <input id="location_latitude" name="location_latitude" type="number" step="any" min={-90} max={90} className={inputClass} />
            </div>
            <div>
              <label htmlFor="location_longitude" className={labelClass}>Longitude</label>
              <input id="location_longitude" name="location_longitude" type="number" step="any" min={-180} max={180} className={inputClass} />
            </div>
          </div>

          <div>
            <label htmlFor="location_description" className={labelClass}>Location Description</label>
            <input
              id="location_description"
              name="location_description"
              type="text"
              maxLength={500}
              placeholder='e.g., "The southern third of Florida"'
              className={inputClass}
            />
          </div>
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={isPending}
        className="w-full sm:w-auto px-6 py-2.5 text-sm font-semibold bg-[var(--gs-gold)] text-[var(--gs-navy)] rounded-lg hover:bg-[var(--gs-gold)]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isPending ? 'Creating...' : 'Log Incident'}
      </button>
    </form>
  );
}
