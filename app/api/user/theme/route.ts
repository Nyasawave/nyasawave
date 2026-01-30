import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

/**
 * GET /api/user/theme
 * Get current user's theme preferences
 */
export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Return default theme - TODO: Connect to database when Prisma is ready
        return NextResponse.json({ theme: 'dark', accentColor: 'blue' });
    } catch (error) {
        console.error('[API] Error fetching theme:', error);
        return NextResponse.json(
            { error: 'Failed to fetch theme' },
            { status: 500 }
        );
    }
}

/**
 * POST /api/user/theme
 * Update user's theme preferences
 */
export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { theme, accentColor } = body;

        // Validate theme
        if (theme && !['dark', 'light', 'custom'].includes(theme)) {
            return NextResponse.json(
                { error: 'Invalid theme' },
                { status: 400 }
            );
        }

        // Return success - TODO: Save to database when Prisma is ready
        return NextResponse.json({ theme: theme || 'dark', accentColor: accentColor || 'blue' });
    } catch (error) {
        console.error('[API] Error updating theme:', error);
        return NextResponse.json(
            { error: 'Failed to update theme' },
            { status: 500 }
        );
    }
}
