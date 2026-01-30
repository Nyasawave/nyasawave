import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * POST /api/admin/users/role
 * Update a user's role
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

        const { userId, newRole } = await req.json();

        if (!userId || !['ADMIN', 'ARTIST', 'LISTENER', 'ENTREPRENEUR', 'MARKETER'].includes(String(newRole).toUpperCase())) {
            return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
        }

        // Normalize role to Prisma enum (uppercase)
        const normalized = String(newRole).toUpperCase() as 'ADMIN' | 'ARTIST' | 'LISTENER' | 'ENTREPRENEUR' | 'MARKETER';

        const user = await prisma.user.update({
            where: { id: userId },
            data: { roles: [normalized] },
        });

        // Create audit log
        await prisma.auditLog.create({
            data: {
                adminId: payload.userId,
                action: 'update_role',
                target: userId,
                targetType: 'user',
                details: { newRole: normalized },
            },
        });

        return NextResponse.json({
            success: true,
            message: 'User role updated successfully',
            userId,
            newRole: normalized,
        });
    } catch (error) {
        console.error('Error updating user role:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
