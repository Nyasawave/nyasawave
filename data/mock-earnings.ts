// Mock earnings data for artist analytics
// Real data will come from streaming events & payment processing

export const mockEarningsData = {
    artistId: 'artist-1',
    totalEarnings: {
        MWK: 15450,
        USD: 15.45,
    },
    totalStreams: 28940,
    totalLikes: 1240,
    boostROI: 3.2, // 320% return on boost spending

    songEarnings: [
        {
            id: 'song-1',
            title: 'Midnight Dreams',
            genre: 'Hip-Hop',
            streams: 8450,
            earnings: { MWK: 4225, USD: 4.23 },
            likes: 420,
            boosts: 2,
            boostEarnings: { MWK: 1350, USD: 1.35 },
            releasedAt: '2024-12-01',
        },
        {
            id: 'song-2',
            title: 'Summer Vibes',
            genre: 'Afrobeats',
            streams: 12300,
            earnings: { MWK: 6150, USD: 6.15 },
            likes: 580,
            boosts: 3,
            boostEarnings: { MWK: 2100, USD: 2.10 },
            releasedAt: '2024-11-15',
        },
        {
            id: 'song-3',
            title: 'Lonely Roads',
            genre: 'Gospel',
            streams: 8190,
            earnings: { MWK: 4095, USD: 4.10 },
            likes: 240,
            boosts: 1,
            boostEarnings: { MWK: 780, USD: 0.78 },
            releasedAt: '2024-10-20',
        },
    ],

    monthlyEarnings: [
        { month: 'Oct', earnings: { MWK: 3200, USD: 3.20 }, streams: 6400 },
        { month: 'Nov', earnings: { MWK: 5600, USD: 5.60 }, streams: 11200 },
        { month: 'Dec', earnings: { MWK: 6650, USD: 6.65 }, streams: 11340 },
    ],

    districtBreakdown: [
        { district: 'Lilongwe', streams: 8940, percentage: 31 },
        { district: 'Blantyre', streams: 6280, percentage: 21 },
        { district: 'Ndola (Zambia)', streams: 4200, percentage: 14 },
        { district: 'Mzuzu', streams: 5420, percentage: 18 },
        { district: 'Zomba', streams: 4100, percentage: 14 },
    ],

    audienceDemographics: {
        ageGroups: [
            { range: '13-18', listeners: 4200, percentage: 18 },
            { range: '19-25', listeners: 9800, percentage: 42 },
            { range: '26-35', listeners: 6500, percentage: 28 },
            { range: '36+', listeners: 2540, percentage: 12 },
        ],
        topDevices: [
            { device: 'Mobile', streams: 18564, percentage: 64 },
            { device: 'Web', streams: 8120, percentage: 28 },
            { device: 'Desktop', streams: 2256, percentage: 8 },
        ],
    },

    boostHistory: [
        {
            id: 'boost-1',
            songId: 'song-1',
            type: 'Premium Boost',
            duration: 24,
            cost: { MWK: 2000, USD: 2.00 },
            playsGenerated: 3200,
            roi: 160,
            startedAt: '2024-12-10',
            endedAt: '2024-12-11',
        },
        {
            id: 'boost-2',
            songId: 'song-2',
            type: 'Global Boost',
            duration: 72,
            cost: { MWK: 5000, USD: 5.00 },
            playsGenerated: 8900,
            roi: 178,
            startedAt: '2024-12-05',
            endedAt: '2024-12-08',
        },
    ],

    earnings_breakdown: {
        streams: { MWK: 9000, USD: 9.00 }, // Per stream rate: ~0.31 MWK
        boosts: { MWK: 4225, USD: 4.23 },
        marketplace: { MWK: 2225, USD: 2.23 }, // Future: ads, merch, etc
    },
};
