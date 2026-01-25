import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const DB = path.join(process.cwd(), 'data', 'users.json');

function readUsers() { try { return JSON.parse(fs.readFileSync(DB, 'utf-8')) || []; } catch (e) { return []; } }
function writeUsers(users: any[]) { fs.writeFileSync(DB, JSON.stringify(users, null, 2)); }

export async function POST(req: Request) {
  const { email } = await req.json();
  if (!email) return NextResponse.json({ error: 'Missing email' }, { status: 400 });

  const users = readUsers();
  const user = users.find((u: any) => u.email === email);
  if (!user) return NextResponse.json({ ok: true });

  // create a reset token (in a real app you'd email this)
  const resetToken = crypto.randomBytes(12).toString('hex');
  user.resetToken = resetToken;
  writeUsers(users);

  // Return the token in the response only for demo purposes
  return NextResponse.json({ ok: true, resetToken });
}
