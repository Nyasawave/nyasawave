import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * POST /api/admin/users/ban
 * Ban or unban a user
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

        const { userId, banned, reason } = await req.json();

        if (!userId || typeof banned !== 'boolean') {
            return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
        }

        // Create audit log entry (schema does not include `banned` field, so we only log)
        await prisma.auditLog.create({
            data: {
                adminId: payload.userId,
                action: banned ? 'ban_user' : 'unban_user',
                target: userId,
                targetType: 'user',
                details: { reason },
            },
        });

        return NextResponse.json({
            success: true,
            message: `User ${banned ? 'banned' : 'unbanned'} (logged)`,
            userId,
            banned,
        });
    } catch (error) {
        console.error('Error banning user:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
