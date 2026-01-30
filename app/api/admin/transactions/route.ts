import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { prisma } from '@/lib/prisma';
import { authOptions } from '../../auth/[...nextauth]/route';

/**
 * GET /api/admin/transactions
 * List recent transactions (admin only)
 */
export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
        });

        if (!user || !user.roles?.includes('ADMIN')) {
            return NextResponse.json(
                { error: 'Admin access required' },
                { status: 403 }
            );
        }

        const transactions = await prisma.transaction.findMany({
            orderBy: { createdAt: 'desc' },
            take: 100,
            select: {
                id: true,
                userId: true,
                type: true,
                amount: true,
                currency: true,
                status: true,
                description: true,
                createdAt: true,
            },
        });

        return NextResponse.json({ transactions });
    } catch (error) {
        console.error('Error fetching transactions:', error);
        return NextResponse.json(
            { error: 'Failed to fetch transactions' },
            { status: 500 }
        );
    }
}
