export async function GET() {
    const stats = {
        totalSongs: 24,
        totalPlaylists: 8,
        totalListeningHours: 156,
        favoriteArtists: 12,
    };

    return Response.json(stats);
}
