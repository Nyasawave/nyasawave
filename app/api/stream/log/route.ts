import { NextRequest, NextResponse } from 'next/server';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';
import jwt from 'jsonwebtoken';

const STREAM_RATE = 0.002; // USD per stream (admin-controlled in future)
const DATA_DIR = join(process.cwd(), 'data');

interface StreamLog {
    id: string;
    trackId: string;
    userId?: string;
    ipAddress?: string;
    streamedAt: string;
    duration: number;
    isValid: boolean;
}

interface RevenueEntry {
    id: string;
    artistId: string;
    source: 'streams' | 'ad_clicks' | 'subscriptions' | 'boosts';
    amount: number;
    trackId?: string;
    timestamp: string;
}

// Load or initialize streams data
function loadStreams(): StreamLog[] {
    const file = join(DATA_DIR, 'streams.json');
    if (!existsSync(file)) {
        writeFileSync(file, JSON.stringify([], null, 2));
        return [];
    }
    return JSON.parse(readFileSync(file, 'utf-8'));
}

// Load or initialize revenue data
function loadRevenue(): RevenueEntry[] {
    const file = join(DATA_DIR, 'revenue.json');
    if (!existsSync(file)) {
        writeFileSync(file, JSON.stringify([], null, 2));
        return [];
    }
    return JSON.parse(readFileSync(file, 'utf-8'));
}

// Load users data
function loadUsers(): any[] {
    const file = join(DATA_DIR, 'users.json');
    if (!existsSync(file)) return [];
    return JSON.parse(readFileSync(file, 'utf-8'));
}

// Load tracks data
function loadTracks(): any[] {
    const file = join(DATA_DIR, 'songs.json');
    if (!existsSync(file)) return [];
    return JSON.parse(readFileSync(file, 'utf-8'));
}

// Save streams
function saveStreams(streams: StreamLog[]) {
    const file = join(DATA_DIR, 'streams.json');
    writeFileSync(file, JSON.stringify(streams, null, 2));
}

// Save revenue
function saveRevenue(revenue: RevenueEntry[]) {
    const file = join(DATA_DIR, 'revenue.json');
    writeFileSync(file, JSON.stringify(revenue, null, 2));
}

// Check for spam/duplicate streams
function isValidStream(
    trackId: string,
    userId: string | undefined,
    ipAddress: string | undefined,
    existingStreams: StreamLog[]
): boolean {
    const now = new Date();
    const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);

    // If no user or IP, can't validate
    if (!userId && !ipAddress) return false;

    // Check for duplicate plays in last 5 minutes (spam prevention)
    const recentStreams = existingStreams.filter((s) => {
        const streamTime = new Date(s.streamedAt);
        return streamTime > fiveMinutesAgo && s.trackId === trackId;
    });

    if (userId) {
        const userRecentStreams = recentStreams.filter((s) => s.userId === userId);
        if (userRecentStreams.length >= 5) return false; // Max 5 plays per track per user in 5 min
    }

    if (ipAddress) {
        const ipRecentStreams = recentStreams.filter((s) => s.ipAddress === ipAddress);
        if (ipRecentStreams.length >= 10) return false; // Max 10 plays per track per IP in 5 min
    }

    return true;
}

export async function POST(req: NextRequest) {
    try {
        // Parse request
        const body = await req.json();
        const { trackId, duration, ipAddress } = body;

        if (!trackId || !duration || duration < 30) {
            return NextResponse.json(
                { error: 'Track must play ≥30 seconds' },
                { status: 400 }
            );
        }

        // Extract user from auth header
        let userId: string | undefined;
        const token = req.headers.get('Authorization')?.replace('Bearer ', '');
        if (token) {
            try {
                const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default-secret') as any;
                userId = decoded.userId;
            } catch {
                // Guest user, use IP
            }
        }

        // Get current streams and tracks
        const streams = loadStreams();
        const tracks = loadTracks();
        const users = loadUsers();

        // Find track and artist
        const track = tracks.find((t: any) => t.id === trackId);
        if (!track) {
            return NextResponse.json({ error: 'Track not found' }, { status: 404 });
        }

        // Find artist
        const artist = users.find((u: any) => u.id === track.artistId && u.role === 'ARTIST');
        if (!artist) {
            return NextResponse.json({ error: 'Artist not found' }, { status: 404 });
        }

        // Validate stream (spam check)
        const isValid = isValidStream(trackId, userId, ipAddress, streams);

        // Create stream log
        const streamLog: StreamLog = {
            id: `stream_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            trackId,
            userId,
            ipAddress,
            streamedAt: new Date().toISOString(),
            duration,
            isValid,
        };

        streams.push(streamLog);

        // If valid, create earning entry
        if (isValid) {
            const earning: RevenueEntry = {
                id: `earn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                artistId: artist.id,
                source: 'streams',
                amount: STREAM_RATE,
                trackId,
                timestamp: new Date().toISOString(),
            };

            const revenue = loadRevenue();
            revenue.push(earning);
            saveRevenue(revenue);

            // Update track play count in memory (would be DB in production)
            track.playCount = (track.playCount || 0) + 1;
        }

        // Save updated streams
        saveStreams(streams);

        return NextResponse.json({
            ok: true,
            stream: streamLog,
            earned: isValid ? STREAM_RATE : 0,
            message: isValid ? 'Stream logged and earnings recorded' : 'Stream logged but marked invalid (spam detected)',
        });
    } catch (error) {
        console.error('[STREAM LOG ERROR]', error);
        return NextResponse.json(
            { error: 'Failed to log stream' },
            { status: 500 }
        );
    }
}

// GET analytics for a track or artist
export async function GET(req: NextRequest) {
    try {
        const token = req.headers.get('Authorization')?.replace('Bearer ', '');
        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default-secret') as any;
        const userId = decoded.userId;

        const trackId = req.nextUrl.searchParams.get('trackId');
        const period = req.nextUrl.searchParams.get('period'); // 'day', 'week', 'month'

        const streams = loadStreams();
        const revenue = loadRevenue();
        const users = loadUsers();
        const tracks = loadTracks();

        // Filter by track
        let relevantStreams = streams;
        if (trackId) {
            relevantStreams = streams.filter((s) => s.trackId === trackId);
        }

        // Filter by period
        let periodDate = new Date();
        if (period === 'day') {
            periodDate = new Date(new Date().setDate(new Date().getDate() - 1));
        } else if (period === 'week') {
            periodDate = new Date(new Date().setDate(new Date().getDate() - 7));
        } else if (period === 'month') {
            periodDate = new Date(new Date().setMonth(new Date().getMonth() - 1));
        }

        const filteredStreams = relevantStreams.filter((s) => new Date(s.streamedAt) >= periodDate);
        const validStreams = filteredStreams.filter((s) => s.isValid);

        // Calculate earnings
        const totalEarnings = validStreams.length * STREAM_RATE;

        return NextResponse.json({
            ok: true,
            stats: {
                totalStreams: filteredStreams.length,
                validStreams: validStreams.length,
                totalEarnings,
                period,
                data: {
                    streams: filteredStreams,
                    earnings: revenue.filter((r) => r.trackId === trackId),
                },
            },
        });
    } catch (error) {
        console.error('[STREAM ANALYTICS ERROR]', error);
        return NextResponse.json(
            { error: 'Failed to fetch analytics' },
            { status: 500 }
        );
    }
}
