// Phase 7.2: Royalty & Licensing Automation System
// Manages transparent revenue splits and licensing deals

export interface RoyaltySplit {
  artist: number;        // % to artist
  producer: number;      // % to producer/engineer
  label: number;         // % to label/distributor
  platform: number;      // NyasaWave platform fee
}

export interface RoyaltyConfig {
  trackId: string;
  splits: RoyaltySplit;
  revenueStreams: {
    streams: number;     // Revenue from stream plays
    subscriptions: number; // Revenue from premium subscriptions
    licensing: number;   // Revenue from commercial licensing
    ads: number;         // Revenue from ads
  };
  totalRevenue: number;
  paymentStatus: 'PENDING' | 'APPROVED' | 'PAID';
  lastPaymentDate?: Date;
}

export interface LicensingDeal {
  id: string;
  trackId: string;
  licensee: string;      // Who is using the track
  licenseeType: 'BUSINESS' | 'FILM' | 'PODCAST' | 'RADIO' | 'OTHER';
  usage: string;         // Purpose of usage
  territory: string;     // Geographic territory
  duration: {
    start: Date;
    end: Date;
  };
  fee: number;           // Licensing fee in MWK
  currency: string;
  status: 'PENDING' | 'APPROVED' | 'ACTIVE' | 'EXPIRED';
  terms: string[];       // T&Cs and restrictions
}

// Default royalty splits for Malawi music industry
export const DEFAULT_ROYALTY_SPLITS: RoyaltySplit = {
  artist: 0.70,        // 70% to artist
  producer: 0.15,      // 15% to producer/engineer
  label: 0.05,         // 5% to label (if applicable)
  platform: 0.10,      // 10% NyasaWave platform fee
};

// Earnings per stream formula
export const STREAM_RATES = {
  FREE: {
    value: 0.003,      // MWK 0.003 per free stream
    description: 'Free tier streaming'
  },
  PREMIUM: {
    value: 0.010,      // MWK 0.010 per premium stream
    description: 'Premium subscriber stream'
  },
  SUBSCRIPTION_SHARE: 0.30, // 30% of subscription fee goes to artists
};

// Licensing rate guidelines
export const LICENSING_RATES = {
  COMMERCIAL_VIDEO: {
    min: 50000,        // MWK 50,000 minimum
    per_use: 5000,     // MWK 5,000 per commercial use
    description: 'TV/YouTube commercial use'
  },
  FILM_THEATRICAL: {
    min: 150000,
    per_use: 10000,    // MWK 10,000 per minute
    description: 'Feature film theatrical release'
  },
  PODCAST_EPISODE: {
    min: 15000,
    per_use: 5000,
    description: 'Podcast background music'
  },
  RADIO_BROADCAST: {
    min: 20000,
    per_use: 5000,
    description: 'Radio station broadcast rights'
  },
  EDUCATION: {
    min: 30000,
    per_use: 0,
    description: 'Educational institution license'
  },
};

/**
 * Calculate artist earning from a single stream
 */
export function calculateStreamEarning(
  isPremium: boolean,
  customSplits?: RoyaltySplit
): number {
  const splits = customSplits || DEFAULT_ROYALTY_SPLITS;
  const rate = isPremium ? STREAM_RATES.PREMIUM.value : STREAM_RATES.FREE.value;

  // Artist share of the stream rate
  return rate * splits.artist;
}

/**
 * Calculate total revenue distribution for a track
 */
export function distributeRevenue(
  totalRevenue: number,
  splits: RoyaltySplit
) {
  return {
    artist: totalRevenue * splits.artist,
    producer: totalRevenue * splits.producer,
    label: totalRevenue * splits.label,
    platform: totalRevenue * splits.platform,
  };
}

/**
 * Calculate subscription artist earnings
 * When premium subscriber listens, artist gets a share
 */
export function calculateSubscriptionEarning(
  monthlySubscriptionFee: number = 5000 // MWK
): number {
  // If artist receives 30% of subscription fee
  return monthlySubscriptionFee * STREAM_RATES.SUBSCRIPTION_SHARE;
}

/**
 * Calculate licensing deal revenue split
 */
export function distributeLicensingRevenue(
  licenseeFee: number,
  splits: RoyaltySplit = DEFAULT_ROYALTY_SPLITS
) {
  // For licensing, typically:
  // Artist gets larger share (e.g., 80%)
  // Platform gets smaller fee (e.g., 20%)
  const artistSplit = splits.artist;
  const platformSplit = splits.platform;

  return {
    artist: licenseeFee * (artistSplit + 0.10), // +10% vs stream rate
    platform: licenseeFee * (platformSplit - 0.05), // -5% vs stream rate
    total: licenseeFee,
  };
}

/**
 * Validate royalty splits (must total 100%)
 */
export function validateRoyaltySplits(splits: RoyaltySplit): boolean {
  const total = splits.artist + splits.producer + splits.label + splits.platform;
  return Math.abs(total - 1.0) < 0.001; // Allow for floating point errors
}

/**
 * Calculate payout amount and schedule
 */
export function calculatePayout(
  totalRevenue: number,
  artistShare: number,
  minimumPayout: number = 1000 // MWK minimum
): {
  payable: boolean;
  amount: number;
  nextPayoutDate: Date;
} {
  const earnings = totalRevenue * artistShare;
  const now = new Date();

  return {
    payable: earnings >= minimumPayout,
    amount: earnings,
    nextPayoutDate: new Date(now.getFullYear(), now.getMonth() + 1, 5), // First of next month
  };
}

/**
 * Generate licensing proposal for business
 */
export function generateLicensingProposal(
  trackId: string,
  licenseeType: string,
  territory: string,
  duration: number // in days
): LicensingDeal {
  let rate = LICENSING_RATES.COMMERCIAL_VIDEO;

  if (licenseeType === 'FILM_THEATRICAL') {
    rate = LICENSING_RATES.FILM_THEATRICAL;
  } else if (licenseeType === 'PODCAST') {
    rate = LICENSING_RATES.PODCAST_EPISODE;
  } else if (licenseeType === 'RADIO') {
    rate = LICENSING_RATES.RADIO_BROADCAST;
  } else if (licenseeType === 'EDUCATION') {
    rate = LICENSING_RATES.EDUCATION;
  }

  const startDate = new Date();
  const endDate = new Date(startDate.getTime() + (duration * 24 * 60 * 60 * 1000));

  return {
    id: `LICENSE-${Date.now()}`,
    trackId,
    licensee: 'TO_BE_DETERMINED',
    licenseeType: licenseeType as any,
    usage: `${licenseeType} licensing`,
    territory,
    duration: {
      start: startDate,
      end: endDate,
    },
    fee: (rate as any).min || 50000,
    currency: 'MWK',
    status: 'PENDING',
    terms: [
      'Non-exclusive license',
      'Territory: ' + territory,
      'Duration: ' + duration + ' days',
      'Credit required in all uses',
      'Commercial use only (non-exclusive)',
    ],
  };
}

/**
 * Track payment for transparent accounting
 */
export function createPaymentRecord(
  artistId: string,
  amount: number,
  source: 'STREAMS' | 'SUBSCRIPTIONS' | 'LICENSING' | 'ADS',
  period: string // "YYYY-MM"
) {
  return {
    id: `PAY-${Date.now()}`,
    artistId,
    amount,
    source,
    period,
    status: 'PENDING',
    createdAt: new Date(),
    processedAt: null,
  };
}

/**
 * Calculate estimated monthly earnings projection
 */
export function projectMonthlyEarnings(
  averageMonthlyStreams: number,
  isPremium: number = 0.1, // 10% premium listeners
  tracks: number = 1
): number {
  const premiumStreams = averageMonthlyStreams * isPremium * tracks;
  const freeStreams = (averageMonthlyStreams * (1 - isPremium)) * tracks;

  const premiumEarning = premiumStreams * calculateStreamEarning(true);
  const freeEarning = freeStreams * calculateStreamEarning(false);

  return premiumEarning + freeEarning;
}
