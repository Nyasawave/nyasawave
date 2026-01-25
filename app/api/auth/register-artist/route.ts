import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { hashPassword, generateToken } from '@/lib/auth';

const DB = path.join(process.cwd(), 'data', 'users.json');

function readUsers() {
  try { return JSON.parse(fs.readFileSync(DB, 'utf-8')) || []; } catch (e) { return []; }
}

function writeUsers(users: any[]) { fs.writeFileSync(DB, JSON.stringify(users, null, 2)); }

export async function POST(req: Request) {
  const body = await req.json();
  const { fullName, stageName, username, email, phone, password, passwordConfirm } = body;
  if (!fullName || !stageName || !username || !email || !phone || !password || !passwordConfirm) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  }
  if (password !== passwordConfirm) return NextResponse.json({ error: 'Passwords do not match' }, { status: 400 });

  const users = readUsers();
  if (users.find((u: any) => u.email === email)) {
    return NextResponse.json({ error: 'Email already in use' }, { status: 400 });
  }
  if (users.find((u: any) => u.username === username)) {
    return NextResponse.json({ error: 'Username already taken' }, { status: 400 });
  }

  const id = crypto.randomBytes(8).toString('hex');
  const hashed = await hashPassword(password);

  const user = {
    id,
    name: fullName,
    stageName,
    username,
    email,
    phone,
    password: hashed,
    subscribed: false,
    role: 'ARTIST',
    createdAt: new Date().toISOString(),
  };

  users.push(user);
  writeUsers(users);

  // Generate JWT token for immediate session
  const token = generateToken({ userId: user.id, email: user.email, role: 'ARTIST' });

  return NextResponse.json({ ok: true, user: { id: user.id, name: user.name, email: user.email, role: user.role, isArtist: true }, token }, { status: 201 });
}
