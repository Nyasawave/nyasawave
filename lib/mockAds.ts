// Mock marketplace ads data
// Real data will come from ad service

export const AD_CATEGORIES = [
    'MUSIC_PROMOTION',
    'ALBUM_LAUNCH',
    'EVENT',
    'BRAND',
    'MERCHANDISE'
] as const;

export const AD_PLACEMENTS = [
    'DISCOVER_FEATURED',
    'HOMEPAGE_BANNER',
    'ARTIST_PAGE',
    'CITY_PROMOTION',
    'TRENDING_CHART'
] as const;

export type AdCategory = typeof AD_CATEGORIES[number];
export type AdPlacement = typeof AD_PLACEMENTS[number];

export interface MockAd {
    id: string;
    artistId: string;
    title: string;
    description: string;
    category: AdCategory;
    placement: AdPlacement;
    imageUrl: string;
    targetLocation?: 'BLANTYRE' | 'LILONGWE' | 'MZUZU' | 'ZOMBA' | 'MANGOCHI' | 'NATIONAL';
    startDate: string;
    endDate: string;
    budgetMWK: number;
    budgetUSD: number;
    status: 'ACTIVE' | 'PENDING' | 'EXPIRED' | 'REJECTED';
    impressions: number;
    clicks: number;
    conversions: number;
    roi: number;
}

export interface MockAdSlot {
    id: string;
    placement: AdPlacement;
    location?: string;
    price_per_dayMWK: number;
    price_per_dayUSD: number;
    available_slots: number;
    min_days: number;
    max_days: number;
    description: string;
}

export const MOCK_AD_SLOTS: MockAdSlot[] = [
    {
        id: 'slot-1',
        placement: 'DISCOVER_FEATURED',
        price_per_dayMWK: 10000,
        price_per_dayUSD: 6,
        available_slots: 5,
        min_days: 7,
        max_days: 90,
        description: 'Featured position on Discover page - guaranteed daily visibility'
    },
    {
        id: 'slot-2',
        placement: 'HOMEPAGE_BANNER',
        price_per_dayMWK: 15000,
        price_per_dayUSD: 9,
        available_slots: 3,
        min_days: 14,
        max_days: 90,
        description: 'Large banner on homepage - maximum reach'
    },
    {
        id: 'slot-3',
        placement: 'ARTIST_PAGE',
        price_per_dayMWK: 5000,
        price_per_dayUSD: 3,
        available_slots: 20,
        min_days: 7,
        max_days: 30,
        description: 'Artist profile promotion - targeted audience'
    },
    {
        id: 'slot-4',
        placement: 'TRENDING_CHART',
        price_per_dayMWK: 20000,
        price_per_dayUSD: 12,
        available_slots: 2,
        min_days: 3,
        max_days: 14,
        description: 'Trending chart premium placement - viral potential'
    },
];

export const MOCK_CITY_MULTIPLIERS: Record<string, number> = {
    'BLANTYRE': 1.2,
    'LILONGWE': 1.1,
    'MZUZU': 0.9,
    'ZOMBA': 0.95,
    'MANGOCHI': 0.85,
    'NATIONAL': 1.5,
};

export const MOCK_ACTIVE_ADS: MockAd[] = [
    {
        id: 'ad-1',
        artistId: 'artist-1',
        title: 'Nyasa Dreams - New Single',
        description: 'Listen to the latest from rising star',
        category: 'MUSIC_PROMOTION',
        placement: 'DISCOVER_FEATURED',
        imageUrl: '/api/placeholder?w=500&h=300',
        targetLocation: 'NATIONAL',
        startDate: '2026-01-05',
        endDate: '2026-02-05',
        budgetMWK: 280000,
        budgetUSD: 168,
        status: 'ACTIVE',
        impressions: 24560,
        clicks: 823,
        conversions: 245,
        roi: 3.2,
    },
    {
        id: 'ad-2',
        artistId: 'artist-2',
        title: 'Urban Beats - Album Launch',
        description: 'The most anticipated album of the year',
        category: 'ALBUM_LAUNCH',
        placement: 'HOMEPAGE_BANNER',
        imageUrl: '/api/placeholder?w=500&h=300',
        targetLocation: 'LILONGWE',
        startDate: '2026-01-08',
        endDate: '2026-01-22',
        budgetMWK: 210000,
        budgetUSD: 126,
        status: 'ACTIVE',
        impressions: 15340,
        clicks: 612,
        conversions: 156,
        roi: 2.8,
    },
];

export const MOCK_EXPIRED_ADS: MockAd[] = [
    {
        id: 'ad-expired-1',
        artistId: 'artist-1',
        title: 'Christmas Special Mix',
        description: 'Holiday collection - limited time',
        category: 'MUSIC_PROMOTION',
        placement: 'ARTIST_PAGE',
        imageUrl: '/api/placeholder?w=500&h=300',
        targetLocation: 'BLANTYRE',
        startDate: '2025-12-15',
        endDate: '2025-12-31',
        budgetMWK: 70000,
        budgetUSD: 42,
        status: 'EXPIRED',
        impressions: 8930,
        clicks: 256,
        conversions: 89,
        roi: 2.1,
    },
];

export const mockAdsData = {
    activeAds: MOCK_ACTIVE_ADS,
    expiredAds: MOCK_EXPIRED_ADS,
    availableSlots: MOCK_AD_SLOTS,
};
