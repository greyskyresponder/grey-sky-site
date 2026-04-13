// TODO: test — multi-section vertical scroll with anchors, each section saves independently
'use client';

import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import type { UserProfile } from '@/lib/types/profile';
import type { Affinity } from '@/lib/types/taxonomy';
import { AvatarUpload } from '../AvatarUpload';
import BasicInfoForm from './BasicInfoForm';
import ServiceIdentityForm from './ServiceIdentityForm';
import CommunityEditor from './CommunityEditor';
import OrgEditor from './OrgEditor';
import TeamEditor from './TeamEditor';
import QualificationEditor from './QualificationEditor';
import LanguageEditor from './LanguageEditor';
import AffinityPicker from './AffinityPicker';

interface Props {
  profile: UserProfile;
  allAffinities: Affinity[];
  teamTypes: { id: string; name: string }[];
}

const sectionClass = 'bg-white rounded-lg shadow-sm border border-[var(--gs-cloud)] p-6';

export default function ProfileEditPage({ profile, allAffinities, teamTypes }: Props) {
  const selectedAffinityIds = profile.affinities.map((a) => a.affinity_id);

  return (
    <div className="space-y-6">
      <Link
        href="/dashboard/profile"
        className="inline-flex items-center gap-1 text-sm text-[var(--gs-steel)] hover:text-[var(--gs-navy)] transition-colors"
      >
        <ChevronLeft className="w-4 h-4" />
        Back to Profile
      </Link>

      {/* Avatar */}
      <div className={sectionClass}>
        <h3 className="text-lg font-semibold text-[var(--gs-navy)] mb-4">Profile Photo</h3>
        <AvatarUpload
          currentUrl={profile.avatar_url}
          firstName={profile.first_name ?? ''}
          lastName={profile.last_name ?? ''}
        />
      </div>

      {/* Basic Info */}
      <div id="basic-info" className={sectionClass}>
        <h3 className="text-lg font-semibold text-[var(--gs-navy)] mb-1">You</h3>
        <p className="text-sm text-[var(--gs-steel)] mb-4">The basics. How you want to be known.</p>
        <BasicInfoForm profile={profile} />
      </div>

      {/* Service Identity */}
      <div id="service-identity" className={sectionClass}>
        <h3 className="text-lg font-semibold text-[var(--gs-navy)] mb-1">Your Service</h3>
        <p className="text-sm text-[var(--gs-steel)] mb-4">What you do and how long you&apos;ve been doing it. Every year counts.</p>
        <ServiceIdentityForm profile={profile} />
      </div>

      {/* Communities */}
      <div id="communities" className={sectionClass}>
        <h3 className="text-lg font-semibold text-[var(--gs-navy)] mb-1">Where You&apos;ve Served</h3>
        <p className="text-sm text-[var(--gs-steel)] mb-4">The places you&apos;ve protected. The communities that know your name.</p>
        <CommunityEditor communities={profile.communities} />
      </div>

      {/* Organizations */}
      <div id="organizations" className={sectionClass}>
        <h3 className="text-lg font-semibold text-[var(--gs-navy)] mb-1">Who You&apos;ve Served With</h3>
        <p className="text-sm text-[var(--gs-steel)] mb-4">The agencies, departments, and organizations that shaped your service.</p>
        <OrgEditor orgs={profile.service_orgs} />
      </div>

      {/* Teams */}
      <div id="teams" className={sectionClass}>
        <h3 className="text-lg font-semibold text-[var(--gs-navy)] mb-1">Your Teams</h3>
        <p className="text-sm text-[var(--gs-steel)] mb-4">The crews, task forces, and units you&apos;ve been part of.</p>
        <TeamEditor teams={profile.teams} teamTypes={teamTypes} />
      </div>

      {/* Qualifications */}
      <div id="qualifications" className={sectionClass}>
        <h3 className="text-lg font-semibold text-[var(--gs-navy)] mb-1">What You Bring</h3>
        <p className="text-sm text-[var(--gs-steel)] mb-4">Certifications, licenses, and credentials you hold — from any source.</p>
        <QualificationEditor qualifications={profile.qualifications} />
      </div>

      {/* Languages */}
      <div id="languages" className={sectionClass}>
        <h3 className="text-lg font-semibold text-[var(--gs-navy)] mb-1">Languages</h3>
        <p className="text-sm text-[var(--gs-steel)] mb-4">Every language is a lifeline in a disaster.</p>
        <LanguageEditor languages={profile.languages} />
      </div>

      {/* Affinities */}
      <div id="affinities" className={sectionClass}>
        <h3 className="text-lg font-semibold text-[var(--gs-navy)] mb-1">What Connects You</h3>
        <p className="text-sm text-[var(--gs-steel)] mb-4">Select the hazards, specialties, and sectors that define your experience.</p>
        <AffinityPicker allAffinities={allAffinities} selectedIds={selectedAffinityIds} />
      </div>
    </div>
  );
}
