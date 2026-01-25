// Boost pricing & features
// This is where NyasaWave makes money

export const BOOST_TYPES = {
    free: {
        id: 'free',
        name: 'Free Discovery',
        description: 'Normal discovery queue',
        price: { MWK: 0, USD: 0 },
        durationHours: 24,
        features: [
            'Added to discovery queue',
            'Standard visibility',
            'Basic analytics',
        ],
        playsEstimate: 100,
        color: 'gray',
    },
    premium: {
        id: 'premium',
        name: 'Premium Boost',
        description: 'Home & Trending placement',
        price: { MWK: 2000, USD: 2.0 },
        durationHours: 24,
        features: [
            'Featured on Home page',
            'Trending section',
            'Push notification to followers',
            'Detailed analytics',
            'Play predictions',
        ],
        playsEstimate: 500,
        color: 'emerald',
    },
    global: {
        id: 'global',
        name: 'Global Boost',
        description: 'Maximum visibility',
        price: { MWK: 5000, USD: 5.0 },
        durationHours: 72,
        features: [
            'All users see your track',
            'Home + Trending + Featured',
            'Push notifications',
            'Email campaign',
            'Advanced analytics',
            'A/B testing insights',
            'Malawi-wide coverage',
        ],
        playsEstimate: 2000,
        color: 'blue',
    },
    sponsor: {
        id: 'sponsor',
        name: 'Sponsor Boost',
        description: 'Label-backed promotion',
        price: { MWK: 10000, USD: 10.0 },
        durationHours: 168, // 7 days
        features: [
            'All Global features',
            'Artist spotlight section',
            'Playlist curator contact',
            'Social media promotion',
            'Dedicated account support',
            'Weekly performance reports',
        ],
        playsEstimate: 5000,
        color: 'purple',
    },
};

export const BOOST_TIERS = [
    BOOST_TYPES.premium,
    BOOST_TYPES.global,
    BOOST_TYPES.sponsor,
];
