import { NextRequest, NextResponse } from 'next/server';
import { uploadDocument } from '@/lib/actions/documents';

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const { id, error } = await uploadDocument(formData);
  if (error) return NextResponse.json({ error }, { status: 400 });
  return NextResponse.json({ id }, { status: 201 });
}
