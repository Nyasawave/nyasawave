import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import fs from 'fs/promises';
import path from 'path';

const TOURNAMENTS_DB = path.join(process.cwd(), 'data', 'tournaments.json');
const VOTES_DB = path.join(process.cwd(), 'data', 'tournament-votes.json');
const PLAYS_DB = path.join(process.cwd(), 'data', 'plays.json');
const LIKES_DB = path.join(process.cwd(), 'data', 'likes.json');
const DOWNLOADS_DB = path.join(process.cwd(), 'data', 'downloads.json');

async function fileExists(filePath: string): Promise<boolean> {
    try {
        await fs.access(filePath);
        return true;
    } catch {
        return false;
    }
}

/**
 * POST /api/tournaments/calculate-winners
 * Calculate tournament winners based on scoring metrics
 * Admin only
 */
export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Check if user is admin
        if (!Array.isArray(session.user.roles) || !session.user.roles.includes('ADMIN')) {
            return NextResponse.json(
                { error: 'Only admins can calculate winners' },
                { status: 403 }
            );
        }

        const { tournamentId } = await request.json();
        if (!tournamentId) {
            return NextResponse.json(
                { error: 'Tournament ID required' },
                { status: 400 }
            );
        }

        // Read tournament
        const tournamentsContent = await fs.readFile(TOURNAMENTS_DB, 'utf-8');
        const tournaments = JSON.parse(tournamentsContent);
        const tournament = tournaments.find((t: any) => t.id === tournamentId);

        if (!tournament) {
            return NextResponse.json(
                { error: 'Tournament not found' },
                { status: 404 }
            );
        }

        if (tournament.status !== 'active') {
            return NextResponse.json(
                { error: 'Tournament is not active' },
                { status: 400 }
            );
        }

        // Calculate scores for all participants
        const scores: Record<string, number> = {};

        // Read all metric sources
        const votesContent = await fileExists(VOTES_DB) ? await fs.readFile(VOTES_DB, 'utf-8') : '[]';
        const playsContent = await fileExists(PLAYS_DB) ? await fs.readFile(PLAYS_DB, 'utf-8') : '[]';
        const likesContent = await fileExists(LIKES_DB) ? await fs.readFile(LIKES_DB, 'utf-8') : '[]';
        const downloadsContent = await fileExists(DOWNLOADS_DB) ? await fs.readFile(DOWNLOADS_DB, 'utf-8') : '[]';

        const votes = JSON.parse(votesContent);
        const plays = JSON.parse(playsContent);
        const likes = JSON.parse(likesContent);
        const downloads = JSON.parse(downloadsContent);

        // Initialize scores for participants
        tournament.participants?.forEach((artistId: string) => {
            scores[artistId] = 0;
        });

        // Count votes (1 point each)
        votes
            .filter((v: any) => v.tournamentId === tournamentId)
            .forEach((v: any) => {
                if (scores.hasOwnProperty(v.artistId)) {
                    scores[v.artistId] += 1;
                }
            });

        // Count plays (0.5 points each)
        plays
            .filter((p: any) => p.tournamentId === tournamentId)
            .forEach((p: any) => {
                if (scores.hasOwnProperty(p.artistId)) {
                    scores[p.artistId] += 0.5;
                }
            });

        // Count likes (2 points each)
        likes
            .filter((l: any) => l.tournamentId === tournamentId)
            .forEach((l: any) => {
                if (scores.hasOwnProperty(l.artistId)) {
                    scores[l.artistId] += 2;
                }
            });

        // Count downloads (5 points each)
        downloads
            .filter((d: any) => d.tournamentId === tournamentId)
            .forEach((d: any) => {
                if (scores.hasOwnProperty(d.artistId)) {
                    scores[d.artistId] += 5;
                }
            });

        // Sort by score descending and get top 3 winners
        const ranked = Object.entries(scores)
            .map(([artistId, score]) => ({ artistId, score }))
            .sort((a, b) => b.score - a.score)
            .slice(0, 3);

        // Calculate prize distribution (example: 50%, 30%, 20%)
        const prizeDistribution = [0.5, 0.3, 0.2];
        const winners = ranked.map((winner, index) => ({
            rank: index + 1,
            artistId: winner.artistId,
            score: winner.score,
            prizeAmount: (tournament.prizePool * (prizeDistribution[index] || 0)).toFixed(2),
        }));

        // Update tournament
        tournament.status = 'completed';
        tournament.winners = winners;
        tournament.completedAt = new Date().toISOString();

        // Save updated tournaments
        const updatedTournaments = tournaments.map((t: any) =>
            t.id === tournamentId ? tournament : t
        );
        await fs.writeFile(TOURNAMENTS_DB, JSON.stringify(updatedTournaments, null, 2));

        return NextResponse.json(
            {
                success: true,
                tournament: {
                    id: tournament.id,
                    title: tournament.title,
                    status: tournament.status,
                    winners,
                },
            },
            { status: 200 }
        );
    } catch (error) {
        console.error('[TOURNAMENTS] Calculate winners error:', error);
        return NextResponse.json(
            { error: 'Failed to calculate winners' },
            { status: 500 }
        );
    }
}

/**
 * GET /api/tournaments/calculate-winners?tournamentId=...
 * Get calculated winners for a tournament
 */
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const tournamentId = searchParams.get('tournamentId');

        if (!tournamentId) {
            return NextResponse.json(
                { error: 'Tournament ID required' },
                { status: 400 }
            );
        }

        const tournamentsContent = await fs.readFile(TOURNAMENTS_DB, 'utf-8');
        const tournaments = JSON.parse(tournamentsContent);
        const tournament = tournaments.find((t: any) => t.id === tournamentId);

        if (!tournament) {
            return NextResponse.json(
                { error: 'Tournament not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            tournament: {
                id: tournament.id,
                title: tournament.title,
                status: tournament.status,
                winners: tournament.winners || [],
            },
        });
    } catch (error) {
        console.error('[TOURNAMENTS] Get winners error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch winners' },
            { status: 500 }
        );
    }
}
