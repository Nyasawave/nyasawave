// Mock investor data and platform metrics
// Real data will come from analytics service

export interface InvestorMetrics {
    totalUsers: number;
    activeArtists: number;
    totalStreams: number;
    monthlyStreams: number;
    platformRevenueMWK: number;
    platformRevenueUSD: number;
    monthlyGrowth: number;
    avgUserRetention: number;
    boostsPurchased: number;
    activeAds: number;
}

export interface RevenueStream {
    name: string;
    revenueMWK: number;
    revenueUSD: number;
    percentage: number;
    growthRate: number;
}

export const mockInvestorMetrics: InvestorMetrics = {
    totalUsers: 28450,
    activeArtists: 2847,
    totalStreams: 8947600,
    monthlyStreams: 1289450,
    platformRevenueMWK: 4256000,
    platformRevenueUSD: 2553,
    monthlyGrowth: 23,
    avgUserRetention: 68,
    boostsPurchased: 423,
    activeAds: 47,
};

export const revenueStreams: RevenueStream[] = [
    {
        name: 'Artist Boosts (20% commission)',
        revenueMWK: 1705000,
        revenueUSD: 1023,
        percentage: 40,
        growthRate: 35,
    },
    {
        name: 'Marketplace Ads (25% commission)',
        revenueMWK: 1278000,
        revenueUSD: 766,
        percentage: 30,
        growthRate: 42,
    },
    {
        name: 'Premium Subscriptions',
        revenueMWK: 852000,
        revenueUSD: 511,
        percentage: 20,
        growthRate: 18,
    },
    {
        name: 'Artist Licensing & Sync',
        revenueMWK: 427000,
        revenueUSD: 256,
        percentage: 10,
        growthRate: 28,
    },
];

export const projectedGrowth = [
    { month: 'Jan', revenue: 1000, users: 8000, artists: 800 },
    { month: 'Feb', revenue: 1340, users: 10200, artists: 950 },
    { month: 'Mar', revenue: 1650, users: 12500, artists: 1100 },
    { month: 'Apr', revenue: 2120, users: 15300, artists: 1350 },
    { month: 'May', revenue: 2814, users: 19100, artists: 1650 },
    { month: 'Jun', revenue: 3456, users: 23400, artists: 2000 },
];

export const marketOppportunity = {
    totalAfricanPopulation: 1400000000,
    internetUsers: 350000000,
    musicStreamingPenetration: 0.18, // 18%
    addressableMarketStreaming: 63000000,
    addressableMarketAds: 35000000,
    competitorAvgRevPerUser: 2.5,
    nyasawaveTargetRevPerUser: 3.5,
};

export const useCase = {
    problem:
        'African artists are overlooked by global platforms. Malawi has incredible talent but no infrastructure to monetize it. Artists earn $0.003 per stream elsewhere. Communities can\'t discover local music. Marketers can\'t reach engaged African audiences.',
    solution:
        'NyasaWave: First artist-first platform designed for Africa. Artists keep 80% of boost/ad revenue (vs industry 50%). Location-based discovery helps local artists. Transparent analytics build trust. Two-tier pricing (MWK + USD) welcomes everyone.',
    traction: [
        '2,847 artists onboarded in 3 months (no paid marketing)',
        '8.9M+ streams (organic growth only)',
        'MWK 4.2M revenue with zero institutional funding',
        '68% user retention (industry avg: 45%)',
        '23% month-over-month growth',
    ],
};

export const fundingUse = [
    {
        category: 'Product Development',
        percentage: 35,
        description: 'Mobile apps (iOS/Android), real payment integration, AI recommendations',
    },
    {
        category: 'Go-to-Market',
        percentage: 25,
        description: 'Artist partnerships, influencer campaigns, regional expansion',
    },
    {
        category: 'Operations',
        percentage: 20,
        description: 'Team hiring (eng, marketing, support), infrastructure, compliance',
    },
    {
        category: 'Content & Creator Relations',
        percentage: 15,
        description: 'Artist onboarding programs, community building, events',
    },
    {
        category: 'Contingency',
        percentage: 5,
        description: 'Legal, audit, miscellaneous',
    },
];

export const teamMembers = [
    {
        name: 'Founder / CEO',
        title: 'Product & Vision',
        background: 'Background in startup infrastructure, music tech',
    },
    {
        name: 'CTO (Hiring)',
        title: 'Engineering',
        background: 'Seeking experienced full-stack engineer with payment systems expertise',
    },
    {
        name: 'Head of Growth (Hiring)',
        title: 'Artist partnerships & marketing',
        background: 'Experience with African markets and creator platforms',
    },
];

export const expandedRoadmap = [
    {
        phase: 'Phase 1 (Current)',
        timeline: 'Jan - Mar 2026',
        milestones: ['Core platform complete', 'Artist boost system', 'Marketplace ads', 'Admin controls'],
    },
    {
        phase: 'Phase 2 (Mobile)',
        timeline: 'Apr - Jun 2026',
        milestones: ['iOS app launch', 'Android app launch', 'Push notifications', 'Offline playback'],
    },
    {
        phase: 'Phase 3 (Real Payments)',
        timeline: 'Jul - Sep 2026',
        milestones: ['Live Airtel Money', 'Live TNM Mpamba', 'Stripe integration', 'Payout automation'],
    },
    {
        phase: 'Phase 4 (Regional Expansion)',
        timeline: 'Oct - Dec 2026',
        milestones: ['Zimbabwe launch', 'Tanzania launch', 'Kenya pilot', 'Regional partnerships'],
    },
];
