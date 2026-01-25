import { NextRequest, NextResponse } from 'next/server';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import jwt from 'jsonwebtoken';

const DATA_DIR = join(process.cwd(), 'data');

interface KYCSubmission {
    id: string;
    userId: string;
    fullName: string;
    dateOfBirth: string;
    nationality: string;
    address: string;
    city: string;
    country: string;
    idType: string;
    idNumber: string;
    idFrontUrl?: string;
    idBackUrl?: string;
    phone: string;
    status: string;
    rejectionReason?: string;
    reviewedAt?: string;
    reviewedBy?: string;
    createdAt: string;
    updatedAt: string;
}

function loadKYC(): KYCSubmission[] {
    try {
        const path = join(DATA_DIR, 'kyc-submissions.json');
        return JSON.parse(readFileSync(path, 'utf-8'));
    } catch {
        return [];
    }
}

function saveKYC(data: KYCSubmission[]) {
    const path = join(DATA_DIR, 'kyc-submissions.json');
    writeFileSync(path, JSON.stringify(data, null, 2));
}

// ADMIN ONLY: Get all pending KYC submissions
export async function GET(req: NextRequest) {
    try {
        const authHeader = req.headers.get('authorization');
        const token = authHeader?.replace('Bearer ', '');

        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default-secret') as any;

        // Check admin
        if (decoded.role !== 'ADMIN' || decoded.email !== 'trapkost2020@gmail.com') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const kyc = loadKYC();

        // Return pending submissions
        const pending = kyc.filter(k => k.status === 'pending');
        const approved = kyc.filter(k => k.status === 'approved');
        const rejected = kyc.filter(k => k.status === 'rejected');

        return NextResponse.json({
            ok: true,
            stats: {
                total: kyc.length,
                pending: pending.length,
                approved: approved.length,
                rejected: rejected.length,
            },
            submissions: {
                pending,
                approved,
                rejected,
            },
        });
    } catch (error: any) {
        console.error('[KYC GET ERROR]', error);
        return NextResponse.json(
            { error: error.message || 'Failed to fetch KYC' },
            { status: 500 }
        );
    }
}

// ADMIN ONLY: Approve/Reject KYC
export async function PATCH(req: NextRequest) {
    try {
        const authHeader = req.headers.get('authorization');
        const token = authHeader?.replace('Bearer ', '');

        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default-secret') as any;

        // Check admin
        if (decoded.role !== 'ADMIN' || decoded.email !== 'trapkost2020@gmail.com') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const { kycId, status, rejectionReason } = await req.json();

        if (!kycId || !status) {
            return NextResponse.json(
                { error: 'KYC ID and status required' },
                { status: 400 }
            );
        }

        if (!['approved', 'rejected'].includes(status)) {
            return NextResponse.json(
                { error: 'Status must be approved or rejected' },
                { status: 400 }
            );
        }

        const kyc = loadKYC();
        const submission = kyc.find(k => k.id === kycId);

        if (!submission) {
            return NextResponse.json({ error: 'KYC not found' }, { status: 404 });
        }

        // Update submission
        submission.status = status;
        submission.reviewedAt = new Date().toISOString();
        submission.reviewedBy = decoded.userId;
        if (status === 'rejected') {
            submission.rejectionReason = rejectionReason || 'Documents do not meet requirements';
        }

        saveKYC(kyc);

        // TODO: Send email to user with approval/rejection

        return NextResponse.json({
            ok: true,
            message: `KYC ${status} successfully`,
            submission,
        });
    } catch (error: any) {
        console.error('[KYC PATCH ERROR]', error);
        return NextResponse.json(
            { error: error.message || 'Failed to update KYC' },
            { status: 500 }
        );
    }
}
