import { redirect } from 'next/navigation';

export const metadata = {
  title: 'Submit Response Report | Grey Sky Responder',
};

// Incidents are now created inline during ICS 222 Response Report submission.
// See: docs/design/GSR-DOC-202-203-PROFILE-DEPLOYMENTS.md (ICS 222 block mapping).
export default function NewIncidentPage() {
  redirect('/dashboard/records/new');
}
