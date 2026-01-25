import { NextRequest, NextResponse } from 'next/server';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';
import jwt from 'jsonwebtoken';

const DATA_DIR = join(process.cwd(), 'data');

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

function loadAds(): Advertisement[] {
    const file = join(DATA_DIR, 'advertisements.json');
    if (!existsSync(file)) {
        writeFileSync(file, JSON.stringify([], null, 2));
        return [];
    }
    return JSON.parse(readFileSync(file, 'utf-8'));
}

function loadBusinesses(): any[] {
    const file = join(DATA_DIR, 'businesses.json');
    if (!existsSync(file)) return [];
    return JSON.parse(readFileSync(file, 'utf-8'));
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
        const { title, description, budget, startDate, endDate, targetGenre, targetAgeMin, targetAgeMax, imageUrl, clickUrl } = body;

        // Validate input
        if (!title || !budget || !startDate || !endDate) {
            return NextResponse.json(
                { error: 'Missing required fields: title, budget, startDate, endDate' },
                { status: 400 }
            );
        }

        if (budget <= 0) {
            return NextResponse.json({ error: 'Budget must be > 0' }, { status: 400 });
        }

        if (new Date(endDate) <= new Date(startDate)) {
            return NextResponse.json({ error: 'End date must be after start date' }, { status: 400 });
        }

        // Find business
        const businesses = loadBusinesses();
        const business = businesses.find((b: any) => b.userId === userId);

        if (!business) {
            return NextResponse.json({ error: 'No business account found' }, { status: 404 });
        }

        if (!business.isVerified) {
            return NextResponse.json(
                { error: 'Business must be verified before creating ads' },
                { status: 403 }
            );
        }

        // Create ad
        const newAd: Advertisement = {
            id: `ad_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            businessId: business.id,
            title,
            description,
            imageUrl,
            clickUrl,
            targetGenre,
            targetAgeMin,
            targetAgeMax,
            budget,
            spent: 0,
            startDate,
            endDate,
            status: 'pending_approval',
            impressions: 0,
            clicks: 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        const ads = loadAds();
        ads.push(newAd);
        saveAds(ads);

        return NextResponse.json({
            ok: true,
            ad: newAd,
            message: 'Ad created and pending admin approval',
        });
    } catch (error) {
        console.error('[AD CREATE ERROR]', error);
        return NextResponse.json({ error: 'Failed to create ad' }, { status: 500 });
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

        const business = businesses.find((b: any) => b.userId === userId);
        if (!business) {
            return NextResponse.json({ error: 'No business account' }, { status: 404 });
        }

        const businessAds = ads.filter((a) => a.businessId === business.id);

        return NextResponse.json({
            ok: true,
            ads: businessAds,
            count: businessAds.length,
        });
    } catch (error) {
        console.error('[AD GET ERROR]', error);
        return NextResponse.json({ error: 'Failed to fetch ads' }, { status: 500 });
    }
}

export async function PATCH(req: NextRequest) {
    try {
        const token = req.headers.get('Authorization')?.replace('Bearer ', '');
        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default-secret') as any;
        const userId = decoded.userId;

        const body = await req.json();
        const { adId, status } = body;

        if (!adId || !status) {
            return NextResponse.json(
                { error: 'Missing required fields: adId, status' },
                { status: 400 }
            );
        }

        const validStatuses = ['draft', 'paused', 'completed'];
        if (!validStatuses.includes(status)) {
            return NextResponse.json(
                { error: 'Invalid status. Must be draft, paused, or completed' },
                { status: 400 }
            );
        }

        const ads = loadAds();
        const businesses = loadBusinesses();

        const business = businesses.find((b: any) => b.userId === userId);
        if (!business) {
            return NextResponse.json({ error: 'No business account' }, { status: 404 });
        }

        const ad = ads.find((a) => a.id === adId && a.businessId === business.id);
        if (!ad) {
            return NextResponse.json({ error: 'Ad not found' }, { status: 404 });
        }

        // Update status
        ad.status = status as any;
        ad.updatedAt = new Date().toISOString();

        saveAds(ads);

        return NextResponse.json({
            ok: true,
            ad,
            message: `Ad status updated to ${status}`,
        });
    } catch (error) {
        console.error('[AD UPDATE ERROR]', error);
        return NextResponse.json({ error: 'Failed to update ad' }, { status: 500 });
    }
}
