export async function GET() {
    const stats = {
        totalTracks: 42,
        totalStreams: 125000,
        monthlyListeners: 8500,
        totalRevenue: 3250.50,
    };

    return Response.json(stats);
}
