export async function GET() {
    const stats = {
        activeCampaigns: 5,
        totalReach: 45000,
        totalEarnings: 8750.25,
        conversionRate: 3.2,
    };

    return Response.json(stats);
}
