// Malawi Mobile Money Payment Integration
// Supports: Airtel Money, TNM Mpamba, Stripe, PayPal

import { getFullURL } from './config';

export type PaymentProvider = 'AIRTEL_MONEY' | 'TNM_MPAMBA' | 'STRIPE' | 'PAYPAL' | 'APPLE_PAY';

export interface PaymentMethod {
  id: PaymentProvider;
  name: string;
  category: 'LOCAL_MOBILE' | 'GLOBAL_CARD' | 'DIGITAL_WALLET';
  countries: string[];
  minAmount: number;
  maxAmount: number;
  fee: number;
  processingTime: string;
  currencies: string[];
  icon: string;
}

export const PAYMENT_METHODS: PaymentMethod[] = [
  {
    id: 'AIRTEL_MONEY',
    name: 'Airtel Money',
    category: 'LOCAL_MOBILE',
    countries: ['MW', 'TZ', 'UG', 'KE', 'ZM'],
    minAmount: 1000,
    maxAmount: 5000000,
    fee: 3.5,
    processingTime: 'Instant',
    currencies: ['MWK'],
    icon: '📱',
  },
  {
    id: 'TNM_MPAMBA',
    name: 'TNM Mpamba',
    category: 'LOCAL_MOBILE',
    countries: ['MW'],
    minAmount: 500,
    maxAmount: 2000000,
    fee: 2.5,
    processingTime: 'Instant',
    currencies: ['MWK'],
    icon: '📱',
  },
  {
    id: 'STRIPE',
    name: 'Stripe',
    category: 'GLOBAL_CARD',
    countries: ['ALL'],
    minAmount: 100,
    maxAmount: 500000,
    fee: 2.9,
    processingTime: '1-2 business days',
    currencies: ['USD', 'EUR', 'GBP', 'ZAR'],
    icon: '💳',
  },
  {
    id: 'PAYPAL',
    name: 'PayPal',
    category: 'DIGITAL_WALLET',
    countries: ['ALL'],
    minAmount: 50,
    maxAmount: 300000,
    fee: 3.5,
    processingTime: '1-3 business days',
    currencies: ['USD', 'EUR', 'GBP'],
    icon: '🅿️',
  },
];

export const PAYMENT_FEES = {
  AIRTEL_MONEY: {
    local: 3.5,
    international: 5.0,
  },
  TNM_MPAMBA: {
    local: 2.5,
    international: 4.0,
  },
  STRIPE: {
    domestic: 2.9,
    international: 3.9,
  },
  PAYPAL: {
    domestic: 3.5,
    international: 4.5,
  },
};

export const PLATFORM_COMMISSION = {
  BOOSTS: 0.2,
  ADS: 0.25,
  SUBSCRIPTIONS: 0.15,
  LICENSING: 0.2,
};

export const MOCK_PAYMENT_RESPONSES = {
  airtelSuccess: {
    status: 'SUCCESS',
    transactionId: 'ATM-2026-001-' + Math.random().toString(36).substring(7).toUpperCase(),
    amount: 15000,
    currency: 'MWK',
    timestamp: new Date().toISOString(),
  },
  tnmSuccess: {
    status: 'SUCCESS',
    transactionId: 'TNM-2026-001-' + Math.random().toString(36).substring(7).toUpperCase(),
    amount: 10000,
    currency: 'MWK',
    timestamp: new Date().toISOString(),
  },
  stripeSuccess: {
    status: 'SUCCESS',
    transactionId: 'ch_' + Math.random().toString(36).substring(7),
    amount: 9,
    currency: 'USD',
    timestamp: new Date().toISOString(),
  },
};

export interface PaymentRequest {
  userId: string;
  amount: number;
  currency: string;
  paymentMethod: 'AIRTEL_MONEY' | 'TNM_MPAMBA' | 'CARD';
  description: string;
  metadata?: Record<string, any>;
}

export interface PaymentResponse {
  transactionId: string;
  status: 'PENDING' | 'SUCCESS' | 'FAILED';
  timestamp: Date;
}

class MalawiPaymentGateway {
  private airtelApiKey = process.env.AIRTEL_MONEY_API_KEY || '';
  private tnmApiKey = process.env.TNM_MPAMBA_API_KEY || '';
  private testMode = process.env.NODE_ENV !== 'production';

  async processAirtelMoneyPayment(request: PaymentRequest): Promise<PaymentResponse> {
    if (this.testMode) {
      return this.mockPaymentResponse();
    }

    try {
      const response = await fetch('https://api.airtel-money.mw/payment/initiate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.airtelApiKey}`,
        },
        body: JSON.stringify({
          amount: request.amount,
          currency: request.currency,
          phoneNumber: request.metadata?.phoneNumber,
          transactionDescription: request.description,
          callbackUrl: getFullURL('/api/payments/callback'),
        }),
      });

      const data = await response.json();

      return {
        transactionId: data.transactionId,
        status: response.ok ? 'PENDING' : 'FAILED',
        timestamp: new Date(),
      };
    } catch (error) {
      console.error('Airtel Money Payment Error:', error);
      return {
        transactionId: '',
        status: 'FAILED',
        timestamp: new Date(),
      };
    }
  }

  async processTNMPayment(request: PaymentRequest): Promise<PaymentResponse> {
    if (this.testMode) {
      return this.mockPaymentResponse();
    }

    try {
      const response = await fetch('https://api.tnm-mpamba.mw/transaction/push', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.tnmApiKey}`,
        },
        body: JSON.stringify({
          amount: request.amount,
          phoneNumber: request.metadata?.phoneNumber,
          description: request.description,
          returnUrl: getFullURL('/api/payments/verify'),
        }),
      });

      const data = await response.json();

      return {
        transactionId: data.transactionId,
        status: response.ok ? 'PENDING' : 'FAILED',
        timestamp: new Date(),
      };
    } catch (error) {
      console.error('TNM Mpamba Payment Error:', error);
      return {
        transactionId: '',
        status: 'FAILED',
        timestamp: new Date(),
      };
    }
  }

  private mockPaymentResponse(): PaymentResponse {
    return {
      transactionId: `TXN-${Date.now()}`,
      status: 'SUCCESS',
      timestamp: new Date(),
    };
  }

  async verifyPayment(transactionId: string): Promise<boolean> {
    if (this.testMode) {
      return true;
    }

    try {
      const response = await fetch(
        `https://api.nyasawave.mw/transaction/verify/${transactionId}`,
        {
          headers: { 'Authorization': `Bearer ${this.airtelApiKey}` },
        }
      );
      const data = await response.json();
      return data.status === 'SUCCESS';
    } catch (error) {
      console.error('Payment verification error:', error);
      return false;
    }
  }
}

export const paymentGateway = new MalawiPaymentGateway();

// Earnings calculation logic (Phase 5.3)
export const EARNINGS_CONFIG = {
  STREAMS: {
    free: 0.003,        // MWK per stream
    premium: 0.010,     // Higher rate for premium listeners
  },
  SUBSCRIPTION: {
    free: 0,
    pro: 100,           // MWK monthly
    premium: 500,       // MWK monthly
  },
  LICENSING: {
    default: 0.20,      // 20% of licensing revenue to artist
  },
  PAYOUT_THRESHOLD: 1000, // MWK minimum payout
  PAYOUT_CYCLE: 'MONTHLY',
};

export async function calculateEarnings(
  artistId: string,
  period: string
): Promise<number> {
  // This would query actual streams and calculate based on EARNINGS_CONFIG
  // Implemented in API route
  return 0;
}
