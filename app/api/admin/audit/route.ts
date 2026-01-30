import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/admin/audit
 * Get audit logs of admin actions
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
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '20');
        const action = searchParams.get('action');

        const where: any = {};
        if (action) where.action = action;

        const [logs, total] = await Promise.all([
            prisma.auditLog.findMany({
                where,
                include: { admin: { select: { email: true, name: true } } },
                skip: (page - 1) * limit,
                take: limit,
                orderBy: { createdAt: 'desc' },
            }),
            prisma.auditLog.count({ where }),
        ]);

        return NextResponse.json({
            success: true,
            data: logs,
            pagination: { page, limit, total, pages: Math.ceil(total / limit) },
        });
    } catch (error) {
        console.error('Error fetching audit logs:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

/**
 * POST /api/admin/audit
 * Create an audit log (internal use)
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

        const { action, target, targetType, details } = await req.json();

        if (!action || !target || !targetType) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const log = await prisma.auditLog.create({
            data: {
                adminId: payload.userId,
                action,
                target,
                targetType,
                details,
            },
        });

        return NextResponse.json({ success: true, message: 'Audit log created', log });
    } catch (error) {
        console.error('Error creating audit log:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
