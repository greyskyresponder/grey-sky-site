import { NextRequest, NextResponse } from 'next/server';
import {
  getDocumentById,
  getDocumentUrl,
  deleteDocument,
  updateDocument,
} from '@/lib/actions/documents';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const [{ document, error }, { url }] = await Promise.all([
    getDocumentById(id),
    getDocumentUrl(id),
  ]);
  if (error || !document) return NextResponse.json({ error: error ?? 'Not found' }, { status: 404 });
  return NextResponse.json({ document, signedUrl: url });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const { error } = await updateDocument(id, body);
  if (error) return NextResponse.json({ error }, { status: 400 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { error } = await deleteDocument(id);
  if (error) return NextResponse.json({ error }, { status: 400 });
  return NextResponse.json({ ok: true });
}
