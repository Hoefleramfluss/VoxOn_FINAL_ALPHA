
export enum VoiceName {
  Puck = 'Puck',
  Charon = 'Charon',
  Kore = 'Kore',
  Fenrir = 'Fenrir',
  Zephyr = 'Zephyr',
  Aoede = 'Aoede',
  Callisto = 'Callisto',
  Leda = 'Leda',
  Himalia = 'Himalia',
  Oberon = 'Oberon'
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
  extraLineMonthlyPrice?: number; // Price for purchasing additional concurrency
  features: string[];
  stripeProductId: string; // Link to Stripe
  stripeOveragePriceId?: string;
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
  status: 'active' | 'inactive' | 'suspended';
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

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'customer';
  customerId?: string; // If role is customer
}

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string; // HTML allowed
  type: 'welcome' | 'reset_password' | 'newsletter' | 'general';
  lastUpdated: string;
}

export type ViewState = 'dashboard' | 'customers' | 'pricing' | 'twilio' | 'server' | 'playground' | 'mails' | 'settings';

export interface AudioVisualizerProps {
  analyser: AnalyserNode | null;
  isActive: boolean;
}

export interface SystemMetrics {
  cpu: number;
  memory: number;
  redis: number;
  activeLines: number;
  uptime: number;
}

// --- TOOL LIBRARY TYPES ---

export interface ToolField {
  key: string;
  label: string;
  type: 'text' | 'password' | 'select' | 'number';
  options?: string[];
  placeholder?: string;
  helperText?: string;
}

export interface ToolTemplate {
  id: string;
  name: string;
  description: string;
  category: 'booking' | 'calendar' | 'crm' | 'utility' | 'ecommerce' | 'support' | 'custom';
  icon: React.ReactNode;
  fields: ToolField[];
  // Function to generate the Gemini FunctionDeclaration based on user inputs
  // Returns either a single object or an array of objects (suites)
  generate: (inputs: Record<string, any>) => any | any[];
}
