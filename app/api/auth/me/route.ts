import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../[...nextauth]/route';

export async function GET() {
  try {
    console.log('[AUTH/ME] GET request received');

    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      console.log('[AUTH/ME] No session found');
      return NextResponse.json(
        { error: 'Not authenticated', user: null },
        { status: 401 }
      );
    }

    console.log('[AUTH/ME] Session found for:', session.user.email);
    console.log('[AUTH/ME] User roles:', session.user.roles);

    return NextResponse.json({
      user: {
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
      },
      roles: session.user.roles || [],
      activePersona: session.user.activePersona || 'LISTENER',
      premiumListener: session.user.premiumListener || false,
      verified: session.user.verified || false,
    });
  } catch (error) {
    console.error('[AUTH/ME] Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error', user: null },
      { status: 500 }
    );
  }
}
