import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const DATA_DIR = join(process.cwd(), 'data');

interface OrderRecord {
    id: string;
    buyerId: string;
    items: Array<{
        productId: string;
        quantity: number;
        price: number;
    }>;
    total: number;
    currency: string;
    status: string;
    paymentId?: string;
    paymentStatus?: string;
    shippingAddress?: string;
    trackingNumber?: string;
    createdAt: string;
    updatedAt: string;
}

function loadOrders(): OrderRecord[] {
    try {
        const path = join(DATA_DIR, 'orders.json');
        return JSON.parse(readFileSync(path, 'utf-8'));
    } catch {
        return [];
    }
}

function saveOrders(data: OrderRecord[]) {
    const path = join(DATA_DIR, 'orders.json');
    writeFileSync(path, JSON.stringify(data, null, 2));
}

// GET /api/orders - Get user's orders
export async function GET(req: NextRequest) {
    try {
        const authHeader = req.headers.get('authorization');
        const token = authHeader?.replace('Bearer ', '');

        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default-secret') as any;

        const orders = loadOrders();
        const userOrders = orders.filter((o) => o.buyerId === decoded.userId);

        return NextResponse.json({
            ok: true,
            count: userOrders.length,
            orders: userOrders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
        });
    } catch (error) {
        console.error('[ORDERS GET ERROR]', error);
        return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
    }
}

// POST /api/orders - Create new order
export async function POST(req: NextRequest) {
    try {
        const authHeader = req.headers.get('authorization');
        const token = authHeader?.replace('Bearer ', '');

        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default-secret') as any;

        const { items, shippingAddress, currency } = await req.json();

        if (!items || !Array.isArray(items) || items.length === 0) {
            return NextResponse.json({ error: 'Items required' }, { status: 400 });
        }

        // Calculate total
        const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

        const order: OrderRecord = {
            id: `ord_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            buyerId: decoded.userId,
            items,
            total,
            currency: currency || 'MWK',
            status: 'pending',
            shippingAddress,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        const orders = loadOrders();
        orders.push(order);
        saveOrders(orders);

        return NextResponse.json({ ok: true, order }, { status: 201 });
    } catch (error) {
        console.error('[ORDERS POST ERROR]', error);
        return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
    }
}
