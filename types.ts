
export enum VoiceName {
  Puck = 'Puck',
  Charon = 'Charon',
  Kore = 'Kore',
  Fenrir = 'Fenrir',
  Zephyr = 'Zephyr',
}

export interface BotConfig {
  systemInstruction: string;
  voiceName: VoiceName;
  greeting: string;
  tools: string; // JSON string representing FunctionDeclarations
}

export interface Bot {
  id: string;
  customerId: string; // Link to customer
  name: string;
  status: 'active' | 'draft' | 'paused';
  createdAt: string;
  lastActive: string;
  config: BotConfig;
  phoneNumber?: string; // Assigned Twilio Number
  stats: {
    calls: number;
    minutes: number;
  };
}

export interface PricingPlan {
  id: string;
  name: string;
  price: number;
  interval: 'month' | 'year' | 'one-time';
  currency: string;
  includedMinutes: number; // Monthly recurring minutes
  signupBonusMinutes: number; // One-time bonus on registration
  overageRatePerMinute: number;
  maxConcurrentLines: number;
  includesPhoneNumber: boolean; // Does the plan include a number?
  phoneNumberMonthlyPrice: number; // Price if renting separately
  features: string[];
  stripeProductId: string; // Link to Stripe
  isPopular?: boolean;
}

export interface CallLog {
    id: string;
    timestamp: string;
    durationSeconds: number;
    cost: number;
    status: 'completed' | 'failed' | 'missed';
    direction: 'inbound' | 'outbound';
    phoneNumber: string;
}

export interface Customer {
  id: string;
  companyName: string;
  contactName: string;
  email: string;
  phone: string;
  address: string;
  vatId: string; // UID-Nummer
  paymentMethod: {
    type: 'credit_card' | 'invoice' | 'paypal';
    details: string; // e.g., "**** 4242" or "DE89 ..."
    status: 'valid' | 'expired';
  };
  planId?: string; // Link to PricingPlan
  signupBonusRemaining?: number; // Track remaining one-time bonus
  status: 'active' | 'inactive';
  billingStats?: {
      currentPeriodStart: string;
      currentPeriodEnd: string;
      usedMinutes: number;
      baseFee: number;
      overageFee: number;
  };
  callHistory?: CallLog[];
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'info' | 'warning' | 'error';
  timestamp: Date;
  read: boolean;
}

export type ViewState = 'dashboard' | 'customers' | 'pricing' | 'twilio' | 'server' | 'playground' | 'settings';

export interface AudioVisualizerProps {
  analyser: AnalyserNode | null;
  isActive: boolean;
}
