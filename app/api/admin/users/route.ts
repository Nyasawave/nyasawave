import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/admin/users
 * Get all users with search/filter
 * Admin only
 */
export async function GET(req: NextRequest) {
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

        // Get query parameters
        const searchParams = req.nextUrl.searchParams;
        const role = searchParams.get('role') || 'all';
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');

        // Use Prisma for real data
        const where: any = {};
        if (role !== 'all') where.roles = { has: role };

        const [users, total] = await Promise.all([
            prisma.user.findMany({
                where,
                select: { id: true, email: true, name: true, roles: true, createdAt: true },
                skip: (page - 1) * limit,
                take: limit,
                orderBy: { createdAt: 'desc' },
            }),
            prisma.user.count({ where }),
        ]);

        // Map to expected shape (temporary `banned` default false because schema does not have banned field)
        const mapped = users.map((u: typeof users[0]) => ({ ...u, banned: false }));

        return NextResponse.json({
            success: true,
            data: mapped,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error('Error fetching users:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
