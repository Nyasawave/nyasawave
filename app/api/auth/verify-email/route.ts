import { NextRequest, NextResponse } from 'next/server';
import { randomBytes } from 'crypto';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const DATA_DIR = join(process.cwd(), 'data');

interface EmailVerificationRecord {
    id: string;
    email: string;
    token: string;
    expiresAt: string;
    createdAt: string;
}

function loadVerifications(): EmailVerificationRecord[] {
    try {
        const path = join(DATA_DIR, 'email-verifications.json');
        return JSON.parse(readFileSync(path, 'utf-8'));
    } catch {
        return [];
    }
}

function saveVerifications(data: EmailVerificationRecord[]) {
    const path = join(DATA_DIR, 'email-verifications.json');
    writeFileSync(path, JSON.stringify(data, null, 2));
}

export async function POST(req: NextRequest) {
    try {
        const { email } = await req.json();

        if (!email || !email.includes('@')) {
            return NextResponse.json({ error: 'Valid email required' }, { status: 400 });
        }

        // Generate verification token (6 digit code or token)
        const token = randomBytes(32).toString('hex');
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(); // 24 hours

        const verifications = loadVerifications();

        // Remove old tokens for this email
        const filtered = verifications.filter(v => v.email !== email);

        // Add new verification
        filtered.push({
            id: `ver_${Date.now()}`,
            email,
            token,
            expiresAt,
            createdAt: new Date().toISOString(),
        });

        saveVerifications(filtered);

        // TODO: Send email with verification link
        // For now, return the token (in production, this would be in email)
        const verificationLink = `${process.env.NEXT_PUBLIC_APP_URL}/verify-email?token=${token}`;

        console.log(`[EMAIL VERIFICATION] Link: ${verificationLink}`);

        return NextResponse.json({
            ok: true,
            message: 'Verification email sent. Check your inbox.',
            // Remove in production - only for testing
            testLink: process.env.NODE_ENV === 'development' ? verificationLink : undefined,
        });
    } catch (error) {
        console.error('[VERIFY EMAIL ERROR]', error);
        return NextResponse.json(
            { error: 'Failed to send verification email' },
            { status: 500 }
        );
    }
}

export async function GET(req: NextRequest) {
    try {
        const token = req.nextUrl.searchParams.get('token');

        if (!token) {
            return NextResponse.json({ error: 'Token required' }, { status: 400 });
        }

        const verifications = loadVerifications();
        const verification = verifications.find(v => v.token === token);

        if (!verification) {
            return NextResponse.json({ error: 'Invalid token' }, { status: 400 });
        }

        if (new Date(verification.expiresAt) < new Date()) {
            return NextResponse.json({ error: 'Token expired' }, { status: 400 });
        }

        // Mark email as verified in users.json
        const usersPath = join(DATA_DIR, 'users.json');
        const users = JSON.parse(readFileSync(usersPath, 'utf-8'));
        const user = users.find((u: any) => u.email === verification.email);

        if (user) {
            user.verified = true;
            user.emailVerifiedAt = new Date().toISOString();
            writeFileSync(usersPath, JSON.stringify(users, null, 2));
        }

        // Remove used token
        saveVerifications(verifications.filter(v => v.token !== token));

        return NextResponse.json({
            ok: true,
            message: 'Email verified successfully',
            email: verification.email,
        });
    } catch (error) {
        console.error('[VERIFY EMAIL GET ERROR]', error);
        return NextResponse.json({ error: 'Verification failed' }, { status: 500 });
    }
}
