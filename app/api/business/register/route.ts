import { NextRequest, NextResponse } from 'next/server';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';
import jwt from 'jsonwebtoken';

const BUSINESS_VERIFICATION_FEE = 49.99;
const DATA_DIR = join(process.cwd(), 'data');

interface Business {
    id: string;
    userId: string;
    name: string;
    description?: string;
    website?: string;
    logo?: string;
    category?: string;
    isVerified: boolean;
    verificationDate?: string;
    phone?: string;
    email?: string;
    createdAt: string;
}

interface Advertisement {
    id: string;
    businessId: string;
    title: string;
    description?: string;
    imageUrl?: string;
    clickUrl?: string;
    targetGenre?: string;
    targetCountry?: string;
    targetAgeMin?: number;
    targetAgeMax?: number;
    budget: number;
    spent: number;
    dailyBudget?: number;
    startDate: string;
    endDate: string;
    status: 'draft' | 'pending_approval' | 'active' | 'paused' | 'completed' | 'rejected';
    impressions: number;
    clicks: number;
    createdAt: string;
    updatedAt: string;
}

function loadBusinesses(): Business[] {
    const file = join(DATA_DIR, 'businesses.json');
    if (!existsSync(file)) {
        writeFileSync(file, JSON.stringify([], null, 2));
        return [];
    }
    return JSON.parse(readFileSync(file, 'utf-8'));
}

function loadAds(): Advertisement[] {
    const file = join(DATA_DIR, 'advertisements.json');
    if (!existsSync(file)) {
        writeFileSync(file, JSON.stringify([], null, 2));
        return [];
    }
    return JSON.parse(readFileSync(file, 'utf-8'));
}

function saveBusinesses(businesses: Business[]) {
    const file = join(DATA_DIR, 'businesses.json');
    writeFileSync(file, JSON.stringify(businesses, null, 2));
}

function saveAds(ads: Advertisement[]) {
    const file = join(DATA_DIR, 'advertisements.json');
    writeFileSync(file, JSON.stringify(ads, null, 2));
}

export async function POST(req: NextRequest) {
    try {
        const token = req.headers.get('Authorization')?.replace('Bearer ', '');
        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default-secret') as any;
        const userId = decoded.userId;

        const body = await req.json();
        const { name, description, website, email, phone, category, action, businessId, ...adData } = body;

        // Register or verify business
        if (action === 'register') {
            const businesses = loadBusinesses();

            // Check if user already has a business
            if (businesses.find((b) => b.userId === userId)) {
                return NextResponse.json(
                    { error: 'You already have a business account' },
                    { status: 400 }
                );
            }

            const newBusiness: Business = {
                id: `biz_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                userId,
                name,
                description,
                website,
                email,
                phone,
                category,
                isVerified: false,
                createdAt: new Date().toISOString(),
            };

            businesses.push(newBusiness);
            saveBusinesses(businesses);

            return NextResponse.json({
                ok: true,
                business: newBusiness,
                message: 'Business registered. Pay verification fee to unlock ads.',
            });
        }

        // Verify business (process payment)
        if (action === 'verify') {
            const businesses = loadBusinesses();
            const business = businesses.find((b) => b.id === businessId && b.userId === userId);

            if (!business) {
                return NextResponse.json(
                    { error: 'Business not found' },
                    { status: 404 }
                );
            }

            if (business.isVerified) {
                return NextResponse.json(
                    { error: 'Business already verified' },
                    { status: 400 }
                );
            }

            // In production, charge via Stripe/Flutterwave
            // For now, mark as verified
            business.isVerified = true;
            business.verificationDate = new Date().toISOString();

            saveBusinesses(businesses);

            return NextResponse.json({
                ok: true,
                business,
                message: `Business verified! Payment of $${BUSINESS_VERIFICATION_FEE} processed.`,
                checkoutUrl: '#', // In production, return Stripe/Flutterwave URL
            });
        }

        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    } catch (error) {
        console.error('[BUSINESS ERROR]', error);
        return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
    }
}

export async function GET(req: NextRequest) {
    try {
        const token = req.headers.get('Authorization')?.replace('Bearer ', '');
        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default-secret') as any;
        const userId = decoded.userId;

        const businesses = loadBusinesses();
        const ads = loadAds();

        const userBusiness = businesses.find((b) => b.userId === userId);

        if (!userBusiness) {
            return NextResponse.json({
                ok: true,
                business: null,
                message: 'No business account. Register to create ads.',
            });
        }

        const businessAds = ads.filter((a) => a.businessId === userBusiness.id);

        const stats = {
            totalAds: businessAds.length,
            activeAds: businessAds.filter((a) => a.status === 'active').length,
            totalImpressions: businessAds.reduce((sum, a) => sum + a.impressions, 0),
            totalClicks: businessAds.reduce((sum, a) => sum + a.clicks, 0),
            totalSpent: businessAds.reduce((sum, a) => sum + a.spent, 0),
            avgCTR: businessAds.length > 0
                ? (businessAds.reduce((sum, a) => sum + (a.clicks / Math.max(a.impressions, 1)), 0) / businessAds.length * 100).toFixed(2)
                : '0',
        };

        return NextResponse.json({
            ok: true,
            business: userBusiness,
            ads: businessAds,
            stats,
        });
    } catch (error) {
        console.error('[BUSINESS GET ERROR]', error);
        return NextResponse.json({ error: 'Failed to fetch business' }, { status: 500 });
    }
}
