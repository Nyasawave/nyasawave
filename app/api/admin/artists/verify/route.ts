import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { prisma } from '@/lib/db';

/**
 * POST /api/admin/artists/verify
 * Approve or reject an artist verification
 * Admin only
 */
export async function POST(req: NextRequest) {
    try {
        // Verify admin token
        const authHeader = req.headers.get('authorization');
        const token = authHeader?.replace('Bearer ', '');

        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const payload = verifyToken(token);
        if (!payload || payload.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const { artistId, action } = await req.json();

        if (!artistId || !['approve', 'reject'].includes(action)) {
            return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
        }

        const artist = await prisma.artist.update({
            where: { id: artistId },
            data: { verified: action === 'approve' },
        });

        // Create audit log
        await prisma.auditLog.create({
            data: {
                adminId: payload.userId,
                action: 'verify_artist',
                target: artistId,
                targetType: 'artist',
                details: { decision: action },
            },
        });

        return NextResponse.json({
            success: true,
            message: `Artist ${action}ed successfully`,
            artistId,
            action,
            verified: artist.verified,
        });
    } catch (error) {
        console.error('Error verifying artist:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
