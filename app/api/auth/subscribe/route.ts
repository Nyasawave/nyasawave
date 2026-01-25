import { NextRequest, NextResponse } from 'next/server';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { verifyToken } from '@/lib/auth';

const DB = join(process.cwd(), 'data', 'users.json');

interface User {
  id: string;
  email: string;
  name: string;
  password: string;
  role: 'ADMIN' | 'ARTIST' | 'USER';
  subscribed?: boolean; // Legacy field
  subscription?: {
    tier: 'free' | 'premium';
    status: 'active' | 'canceled' | 'expired';
    expiresAt?: string; // Optional for free tier
    startDate: string;
  };
  createdAt: string;
}

function readUsers(): User[] {
  try {
    return JSON.parse(readFileSync(DB, 'utf-8')) || [];
  } catch {
    return [];
  }
}

function writeUsers(users: User[]) {
  writeFileSync(DB, JSON.stringify(users, null, 2));
}

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const users = readUsers();
    const user = users.find(u => u.id === payload.userId);

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      ok: true,
      subscription: user.subscription || {
        tier: 'free',
        status: 'active',
      },
      isSubscribed: user.subscription?.tier === 'premium' && user.subscription?.status === 'active',
    });
  } catch (error) {
    console.error('Error fetching subscription:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const body = await req.json();
    const { tier = 'premium', action = 'subscribe' } = body;

    // Validate tier
    if (!['free', 'premium'].includes(tier)) {
      return NextResponse.json(
        { error: 'Invalid subscription tier' },
        { status: 400 }
      );
    }

    const users = readUsers();
    const userIndex = users.findIndex(u => u.id === payload.userId);

    if (userIndex === -1) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const user = users[userIndex];

    if (action === 'subscribe') {
      // Calculate expiration date (30 days from now for premium)
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30);

      user.subscription = {
        tier: tier,
        status: 'active',
        expiresAt: expiresAt.toISOString(),
        startDate: new Date().toISOString(),
      };

      // Legacy field support
      user.subscribed = tier === 'premium';
    } else if (action === 'cancel') {
      if (user.subscription) {
        user.subscription.status = 'canceled';
      }
      user.subscribed = false;
    } else if (action === 'downgrade') {
      user.subscription = {
        tier: 'free',
        status: 'active',
        startDate: new Date().toISOString(),
      };
      user.subscribed = false;
    }

    writeUsers(users);

    return NextResponse.json({
      ok: true,
      message: `Subscription ${action}d successfully`,
      subscription: user.subscription,
      isSubscribed: user.subscription?.tier === 'premium' && user.subscription?.status === 'active',
    });
  } catch (error) {
    console.error('Error updating subscription:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
