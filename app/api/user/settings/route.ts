import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import fs from 'fs';
import path from 'path';

const DB = path.join(process.cwd(), 'data', 'users.json');

function readUsers() {
    try {
        if (fs.existsSync(DB)) {
            return JSON.parse(fs.readFileSync(DB, 'utf-8')) || [];
        }
        return [];
    } catch (e) {
        console.error('[API] Error reading users:', e);
        return [];
    }
}

function writeUsers(users: any[]) {
    try {
        fs.writeFileSync(DB, JSON.stringify(users, null, 2));
        return true;
    } catch (e) {
        console.error('[API] Error writing users:', e);
        return false;
    }
}

/**
 * GET /api/user/settings
 * Get user's settings
 */
export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const users = readUsers();
        const user = users.find((u: any) => u.id === session.user?.id);

        const settings = user?.settings || {
            username: '',
            bio: '',
            profileImage: null,
            theme: 'dark',
            notifications: true,
            emailNotifications: true,
            privateProfile: false,
            stageNameArtist: '',
            genreArtist: '',
            payoutMethodArtist: '',
            platformFeesAdmin: 5,
            tournamentFeeAdmin: 10,
            marketplaceCommissionAdmin: 15,
        };

        return NextResponse.json({
            userId: session.user?.id,
            name: session.user?.name,
            email: session.user?.email,
            ...settings,
        });
    } catch (error) {
        console.error('[API] Error fetching settings:', error);
        return NextResponse.json(
            { error: 'Failed to fetch settings' },
            { status: 500 }
        );
    }
}

/**
 * PUT /api/user/settings
 * Update user's settings
 */
export async function PUT(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();

        // Validate inputs
        if (body.name && typeof body.name !== 'string') {
            return NextResponse.json({ error: 'Invalid name' }, { status: 400 });
        }
        if (body.username && typeof body.username !== 'string') {
            return NextResponse.json({ error: 'Invalid username' }, { status: 400 });
        }
        if (body.bio && typeof body.bio !== 'string') {
            return NextResponse.json({ error: 'Invalid bio' }, { status: 400 });
        }

        const users = readUsers();
        const userIndex = users.findIndex((u: any) => u.id === session.user?.id);

        if (userIndex === -1) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Update settings
        const user = users[userIndex];
        user.settings = {
            ...user.settings,
            username: body.username || user.settings?.username || '',
            bio: body.bio || user.settings?.bio || '',
            profileImage: body.profileImage || user.settings?.profileImage || null,
            theme: body.theme || user.settings?.theme || 'dark',
            notifications: body.notifications !== undefined ? body.notifications : user.settings?.notifications !== false,
            emailNotifications: body.emailNotifications !== undefined ? body.emailNotifications : user.settings?.emailNotifications !== false,
            privateProfile: body.privateProfile !== undefined ? body.privateProfile : user.settings?.privateProfile === true,
            // Artist-specific
            stageNameArtist: body.stageNameArtist || user.settings?.stageNameArtist || '',
            genreArtist: body.genreArtist || user.settings?.genreArtist || '',
            payoutMethodArtist: body.payoutMethodArtist || user.settings?.payoutMethodArtist || '',
            // Admin-specific
            platformFeesAdmin: body.platformFeesAdmin !== undefined ? body.platformFeesAdmin : user.settings?.platformFeesAdmin || 5,
            tournamentFeeAdmin: body.tournamentFeeAdmin !== undefined ? body.tournamentFeeAdmin : user.settings?.tournamentFeeAdmin || 10,
            marketplaceCommissionAdmin: body.marketplaceCommissionAdmin !== undefined ? body.marketplaceCommissionAdmin : user.settings?.marketplaceCommissionAdmin || 15,
        };
        user.updatedAt = new Date().toISOString();

        if (!writeUsers(users)) {
            return NextResponse.json(
                { error: 'Failed to save settings' },
                { status: 500 }
            );
        }

        console.log('[API] Settings updated for user:', session.user?.id);

        return NextResponse.json({
            userId: session.user?.id,
            name: session.user?.name,
            email: session.user?.email,
            ...user.settings,
            success: true,
            message: 'Settings saved successfully',
        });
    } catch (error) {
        console.error('[API] Error updating settings:', error);
        return NextResponse.json(
            { error: 'Failed to update settings' },
            { status: 500 }
        );
    }
}
