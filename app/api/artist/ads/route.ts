import { NextRequest, NextResponse } from 'next/server';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { verifyToken } from '@/lib/auth';

interface Ad {
    id: string;
    artistId: string;
    title: string;
    description: string;
    budget: number;
    spent: number;
    startDate: string;
    endDate: string;
    targetGenre?: string;
    targetAudience?: string;
    status: 'draft' | 'active' | 'paused' | 'completed';
    clickCount: number;
    impressionCount: number;
    createdAt: string;
    trackIds?: string[];
}

const DATA_DIR = join(process.cwd(), 'data');
const ADS_FILE = join(DATA_DIR, 'ads.json');

function readAds(): Ad[] {
    try {
        const data = readFileSync(ADS_FILE, 'utf-8');
        return JSON.parse(data);
    } catch {
        return [];
    }
}

function writeAds(ads: Ad[]) {
    writeFileSync(ADS_FILE, JSON.stringify(ads, null, 2));
}

export async function GET(req: NextRequest) {
    try {
        // Verify artist token
        const authHeader = req.headers.get('authorization');
        const token = authHeader?.replace('Bearer ', '');

        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const payload = verifyToken(token);
        if (!payload || payload.role !== 'ARTIST') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const ads = readAds();
        // Filter ads for this artist
        const artistAds = ads.filter(ad => ad.artistId === payload.userId);

        return NextResponse.json({
            ok: true,
            ads: artistAds,
            totalAds: artistAds.length,
            totalBudget: artistAds.reduce((sum, ad) => sum + ad.budget, 0),
            totalSpent: artistAds.reduce((sum, ad) => sum + ad.spent, 0),
            totalClicks: artistAds.reduce((sum, ad) => sum + ad.clickCount, 0),
        });
    } catch (error) {
        console.error('Error fetching ads:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        // Verify artist token
        const authHeader = req.headers.get('authorization');
        const token = authHeader?.replace('Bearer ', '');

        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const payload = verifyToken(token);
        if (!payload || payload.role !== 'ARTIST') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const body = await req.json();
        const { title, description, budget, startDate, endDate, targetGenre, targetAudience, trackIds } = body;

        // Validation
        if (!title || !budget || !startDate || !endDate) {
            return NextResponse.json(
                { error: 'Missing required fields: title, budget, startDate, endDate' },
                { status: 400 }
            );
        }

        if (budget <= 0) {
            return NextResponse.json({ error: 'Budget must be greater than 0' }, { status: 400 });
        }

        if (new Date(endDate) <= new Date(startDate)) {
            return NextResponse.json({ error: 'End date must be after start date' }, { status: 400 });
        }

        // Create new ad
        const ads = readAds();
        const newAd: Ad = {
            id: `ad_${Date.now()}`,
            artistId: payload.userId,
            title,
            description: description || '',
            budget,
            spent: 0,
            startDate,
            endDate,
            targetGenre: targetGenre || 'all',
            targetAudience: targetAudience || 'all',
            status: 'draft',
            clickCount: 0,
            impressionCount: 0,
            createdAt: new Date().toISOString().split('T')[0],
            trackIds: trackIds || [],
        };

        ads.push(newAd);
        writeAds(ads);

        return NextResponse.json({
            ok: true,
            message: 'Ad created successfully',
            ad: newAd,
        }, { status: 201 });
    } catch (error) {
        console.error('Error creating ad:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function PATCH(req: NextRequest) {
    try {
        // Verify artist token
        const authHeader = req.headers.get('authorization');
        const token = authHeader?.replace('Bearer ', '');

        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const payload = verifyToken(token);
        if (!payload || payload.role !== 'ARTIST') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const body = await req.json();
        const { adId, action, status } = body;

        if (!adId || !action) {
            return NextResponse.json({ error: 'Missing adId or action' }, { status: 400 });
        }

        const ads = readAds();
        const adIndex = ads.findIndex(ad => ad.id === adId && ad.artistId === payload.userId);

        if (adIndex === -1) {
            return NextResponse.json({ error: 'Ad not found' }, { status: 404 });
        }

        const ad = ads[adIndex];

        // Handle different actions
        switch (action) {
            case 'pause':
                ad.status = 'paused';
                break;
            case 'resume':
                ad.status = 'active';
                break;
            case 'launch':
                if (ad.status !== 'draft') {
                    return NextResponse.json({ error: 'Only draft ads can be launched' }, { status: 400 });
                }
                ad.status = 'active';
                break;
            case 'complete':
                ad.status = 'completed';
                break;
            case 'update':
                if (status && ['draft', 'active', 'paused', 'completed'].includes(status)) {
                    ad.status = status;
                }
                break;
            default:
                return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
        }

        writeAds(ads);

        return NextResponse.json({
            ok: true,
            message: `Ad ${action} successful`,
            ad,
        });
    } catch (error) {
        console.error('Error updating ad:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
