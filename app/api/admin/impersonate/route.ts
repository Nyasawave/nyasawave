import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

/**
 * POST /api/admin/impersonate
 * Allow admin to impersonate a user (for troubleshooting)
 * All actions are audited
 */
export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const admin = await prisma.user.findUnique({
            where: { email: session.user.email },
        });

        if (!admin || !admin.roles?.includes('ADMIN')) {
            return NextResponse.json(
                { error: 'Admin access required' },
                { status: 403 }
            );
        }

        const body = await req.json();
        const { userId } = body;

        if (!userId) {
            return NextResponse.json(
                { error: 'userId required' },
                { status: 400 }
            );
        }

        const targetUser = await prisma.user.findUnique({
            where: { id: userId },
        });

        if (!targetUser) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }

        // Log impersonation
        await prisma.auditLog.create({
            data: {
                adminId: admin.id,
                action: 'user_impersonation_start',
                target: userId,
                targetType: 'user',
                details: {
                    impersonatedEmail: targetUser.email,
                    timestamp: new Date().toISOString(),
                },
            },
        });

        return NextResponse.json({
            success: true,
            message: `Now impersonating ${targetUser.email}. All actions will be logged.`,
            impersonatingUser: {
                id: targetUser.id,
                email: targetUser.email,
                name: targetUser.name,
                roles: targetUser.roles,
            },
        });
    } catch (error) {
        console.error('Error impersonating user:', error);
        return NextResponse.json(
            { error: 'Failed to impersonate user' },
            { status: 500 }
        );
    }
}
