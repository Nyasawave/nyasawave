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

export async function POST(req: NextRequest) {
    try {
        const authHeader = req.headers.get('authorization');
        const token = authHeader?.replace('Bearer ', '');

        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default-secret') as any;
        const userId = decoded.userId;

        const {
            fullName,
            dateOfBirth,
            nationality,
            address,
            city,
            country,
            idType,
            idNumber,
            idFrontUrl,
            idBackUrl,
            phone,
        } = await req.json();

        // Validate required fields
        if (!fullName || !dateOfBirth || !nationality || !address || !city || !country || !idType || !idNumber || !phone) {
            return NextResponse.json(
                { error: 'All fields are required' },
                { status: 400 }
            );
        }

        const kyc = loadKYC();

        // Check if user already has pending/approved KYC
        const existing = kyc.find(k => k.userId === userId);
        if (existing && existing.status !== 'rejected') {
            return NextResponse.json(
                { error: 'KYC already submitted. Current status: ' + existing.status },
                { status: 400 }
            );
        }

        // Create new KYC submission
        const newKYC: KYCSubmission = {
            id: `kyc_${Date.now()}`,
            userId,
            fullName,
            dateOfBirth,
            nationality,
            address,
            city,
            country,
            idType,
            idNumber,
            idFrontUrl,
            idBackUrl,
            phone,
            status: 'pending',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        // Remove old rejected submission if exists
        const filtered = kyc.filter(k => !(k.userId === userId && k.status === 'rejected'));
        filtered.push(newKYC);

        saveKYC(filtered);

        return NextResponse.json({
            ok: true,
            message: 'KYC submission received. Pending admin review.',
            kyc: newKYC,
        });
    } catch (error: any) {
        console.error('[KYC SUBMIT ERROR]', error);
        return NextResponse.json(
            { error: error.message || 'Failed to submit KYC' },
            { status: 500 }
        );
    }
}

export async function GET(req: NextRequest) {
    try {
        const authHeader = req.headers.get('authorization');
        const token = authHeader?.replace('Bearer ', '');

        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default-secret') as any;
        const userId = decoded.userId;

        const kyc = loadKYC();
        const userKYC = kyc.find(k => k.userId === userId);

        if (!userKYC) {
            return NextResponse.json({
                ok: true,
                kyc: null,
                message: 'No KYC submission found',
            });
        }

        return NextResponse.json({
            ok: true,
            kyc: userKYC,
        });
    } catch (error: any) {
        console.error('[KYC GET ERROR]', error);
        return NextResponse.json(
            { error: error.message || 'Failed to fetch KYC' },
            { status: 500 }
        );
    }
}
