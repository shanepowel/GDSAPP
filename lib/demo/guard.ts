import { NextResponse } from 'next/server';
import { isDemoReaderRole } from '@/lib/demo/reader';

/** Block REST writes from the shared demonstration identity. */
export function demoWriteBlockedResponse(role: string | null | undefined) {
  if (!isDemoReaderRole(role)) return null;
  return NextResponse.json(
    { error: 'Demonstration build is read-only. Nothing here is a hiring decision.' },
    { status: 403 },
  );
}
