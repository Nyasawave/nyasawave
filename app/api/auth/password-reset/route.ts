import { NextRequest, NextResponse } from 'next/server';
import { randomBytes } from 'crypto';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const DATA_DIR = join(process.cwd(), 'data');

interface PasswordResetRecord {
    id: string;
    email: string;
    token: string;
    expiresAt: string;
    createdAt: string;
}

function loadResets(): PasswordResetRecord[] {
    try {
        const path = join(DATA_DIR, 'password-resets.json');
        return JSON.parse(readFileSync(path, 'utf-8'));
    } catch {
        return [];
    }
}

function saveResets(data: PasswordResetRecord[]) {
    const path = join(DATA_DIR, 'password-resets.json');
    writeFileSync(path, JSON.stringify(data, null, 2));
}

export async function POST(req: NextRequest) {
    try {
        const { email } = await req.json();

        if (!email || !email.includes('@')) {
            return NextResponse.json({ error: 'Valid email required' }, { status: 400 });
        }

        // Check if user exists
        const usersPath = join(DATA_DIR, 'users.json');
        const users = JSON.parse(readFileSync(usersPath, 'utf-8'));
        const user = users.find((u: any) => u.email === email);

        if (!user) {
            // Don't reveal if email exists (security)
            return NextResponse.json({
                ok: true,
                message: 'If an account exists, password reset email will be sent',
            });
        }

        // Generate reset token
        const token = randomBytes(32).toString('hex');
        const expiresAt = new Date(Date.now() + 1 * 60 * 60 * 1000).toISOString(); // 1 hour

        const resets = loadResets();

        // Remove old tokens for this email
        const filtered = resets.filter(r => r.email !== email);

        // Add new reset token
        filtered.push({
            id: `reset_${Date.now()}`,
            email,
            token,
            expiresAt,
            createdAt: new Date().toISOString(),
        });

        saveResets(filtered);

        // TODO: Send email with reset link
        const resetLink = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}`;

        console.log(`[PASSWORD RESET] Link: ${resetLink}`);

        return NextResponse.json({
            ok: true,
            message: 'Password reset link sent to email',
            // Remove in production
            testLink: process.env.NODE_ENV === 'development' ? resetLink : undefined,
        });
    } catch (error) {
        console.error('[PASSWORD RESET ERROR]', error);
        return NextResponse.json(
            { error: 'Failed to process password reset' },
            { status: 500 }
        );
    }
}

export async function PUT(req: NextRequest) {
    try {
        const { token, password, confirmPassword } = await req.json();

        if (!token) {
            return NextResponse.json({ error: 'Token required' }, { status: 400 });
        }

        if (!password || password !== confirmPassword) {
            return NextResponse.json({ error: 'Passwords do not match' }, { status: 400 });
        }

        if (password.length < 6) {
            return NextResponse.json(
                { error: 'Password must be at least 6 characters' },
                { status: 400 }
            );
        }

        const resets = loadResets();
        const reset = resets.find(r => r.token === token);

        if (!reset) {
            return NextResponse.json({ error: 'Invalid or expired token' }, { status: 400 });
        }

        if (new Date(reset.expiresAt) < new Date()) {
            return NextResponse.json({ error: 'Token expired' }, { status: 400 });
        }

        // Hash new password
        const bcrypt = require('bcryptjs');
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Update user password
        const usersPath = join(DATA_DIR, 'users.json');
        const users = JSON.parse(readFileSync(usersPath, 'utf-8'));
        const user = users.find((u: any) => u.email === reset.email);

        if (user) {
            user.password = hashedPassword;
            user.passwordUpdatedAt = new Date().toISOString();
            writeFileSync(usersPath, JSON.stringify(users, null, 2));
        }

        // Remove used token
        saveResets(resets.filter(r => r.token !== token));

        return NextResponse.json({
            ok: true,
            message: 'Password reset successfully',
            redirectUrl: '/signin',
        });
    } catch (error) {
        console.error('[PASSWORD RESET PUT ERROR]', error);
        return NextResponse.json({ error: 'Password reset failed' }, { status: 500 });
    }
}
