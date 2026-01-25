export async function GET() {
    const stats = {
        totalBusinesses: 3,
        totalRevenue: 52000.75,
        activeAds: 12,
        monthlyGrowth: 15.3,
    };

    return Response.json(stats);
}
