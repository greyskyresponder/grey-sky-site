import { NextRequest, NextResponse } from 'next/server';
import { linkDocumentToQualification, unlinkDocument } from '@/lib/actions/documents';

type LinkType = 'qualification' | 'deployment' | 'incident';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = (await request.json()) as { linkType?: LinkType; targetId?: string };

  if (body.linkType === 'qualification' && body.targetId) {
    const { error } = await linkDocumentToQualification(id, body.targetId);
    if (error) return NextResponse.json({ error }, { status: 400 });
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json(
    { error: 'Only qualification linking is supported via this endpoint' },
    { status: 400 }
  );
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const url = new URL(request.url);
  const linkType = url.searchParams.get('linkType') as LinkType | null;
  if (!linkType || !['qualification', 'deployment', 'incident'].includes(linkType)) {
    return NextResponse.json({ error: 'linkType query param required' }, { status: 400 });
  }
  const { error } = await unlinkDocument(id, linkType);
  if (error) return NextResponse.json({ error }, { status: 400 });
  return NextResponse.json({ ok: true });
}
