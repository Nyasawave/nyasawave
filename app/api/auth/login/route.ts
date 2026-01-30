import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import { generateToken } from '@/lib/auth';

const DB_PATHS = [
  path.join(process.cwd(), 'data', 'users.json'),
  path.join(process.cwd(), 'nyasawave', 'data', 'users.json'),
];

function getDBPath() {
  for (const p of DB_PATHS) {
    if (fs.existsSync(p)) return p;
  }
  console.warn('[LOGIN] users.json not found in any path, using first:', DB_PATHS[0]);
  return DB_PATHS[0];
}

const DB = getDBPath();

function readUsers() {
  try {
    if (fs.existsSync(DB)) {
      return JSON.parse(fs.readFileSync(DB, 'utf-8')) || [];
    }
    return [];
  } catch (e) {
    return [];
  }
}

// Compare password with bcrypt hash
async function comparePasswords(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

export async function POST(req: Request) {
  try {
    console.log('[LOGIN] POST request received');

    let body: any;
    try {
      body = await req.json();
      console.log('[LOGIN] Body parsed:', { email: body.email, hasPassword: !!body.password });
    } catch (parseError: any) {
      console.error('[LOGIN] JSON parse error:', parseError.message);
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    const { email, password } = body;

    if (!email || !password) {
      console.log('[LOGIN] Missing credentials:', { hasEmail: !!email, hasPassword: !!password });
      return NextResponse.json({ error: 'Missing email or password' }, { status: 400 });
    }

    console.log('[LOGIN] Reading users from database');
    const users = readUsers();
    console.log('[LOGIN] Total users in database:', users.length);

    const user = users.find((u: any) => u.email === email);

    if (!user) {
      console.log('[LOGIN] User not found:', email);
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    console.log('[LOGIN] User found:', { id: user.id, email: user.email, role: user.role });

    // Compare password
    console.log('[LOGIN] Comparing passwords');
    let passwordMatch = false;
    try {
      passwordMatch = await comparePasswords(password, user.password);
    } catch (compareError: any) {
      console.error('[LOGIN] Password comparison error:', compareError.message);
      return NextResponse.json({ error: 'Authentication failed' }, { status: 500 });
    }

    if (!passwordMatch) {
      console.log('[LOGIN] Password mismatch for user:', email);
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    console.log('[LOGIN] Password matched, generating token');

    // Generate token with JWT
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });
    console.log('[LOGIN] Token generated, returning success');

    const response = {
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        isArtist: user.isArtist || false,
      },
      token,
    };

    console.log('[LOGIN] Response ready:', { userId: response.user.id, userEmail: response.user.email, hasToken: !!response.token });
    return NextResponse.json(response);
  } catch (error: any) {
    console.error('[LOGIN] Unexpected error:', error);
    console.error('[LOGIN] Error stack:', error?.stack);
    return NextResponse.json({ error: error.message || 'Login failed' }, { status: 500 });
  }
}
