import { getSession } from './session';
import { NextResponse } from 'next/server';

export async function requireAuth() {
  const session = await getSession();

  if (!session.isLoggedIn) {
    return NextResponse.json(
      { success: false, message: 'Unauthorized' },
      { status: 401 }
    );
  }

  return null; // Authentication successful
}