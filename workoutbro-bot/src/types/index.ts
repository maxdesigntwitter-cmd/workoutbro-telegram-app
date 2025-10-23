// Enums are now strings in SQLite
export type UserLevel = 'FREE' | 'BASE' | 'BRO' | 'PRO';
export type MaterialCategory = 'PROGRAMS' | 'RECOVERY' | 'NUTRITION' | 'FAQ' | 'TECHNIQUE';
export type SubscriptionStatus = 'PENDING' | 'ACTIVE' | 'EXPIRED' | 'CANCELLED';

// Constants for enum values
export const UserLevel = {
  FREE: 'FREE' as const,
  BASE: 'BASE' as const,
  BRO: 'BRO' as const,
  PRO: 'PRO' as const,
};

export const MaterialCategory = {
  PROGRAMS: 'PROGRAMS' as const,
  RECOVERY: 'RECOVERY' as const,
  NUTRITION: 'NUTRITION' as const,
  FAQ: 'FAQ' as const,
  TECHNIQUE: 'TECHNIQUE' as const,
};

export const SubscriptionStatus = {
  PENDING: 'PENDING' as const,
  ACTIVE: 'ACTIVE' as const,
  EXPIRED: 'EXPIRED' as const,
  CANCELLED: 'CANCELLED' as const,
};

export interface BotConfig {
  botToken: string;
  webhookUrl?: string;
  webhookSecret?: string;
  databaseUrl: string;
  tributeApiKey?: string;
  tributeWebhookSecret?: string;
  freeChannelId: string;
  baseChannelId: string;
  broChatId: string;
  proChatId: string;
  adminTelegramIds: number[];
  logLevel: string;
  logChatId?: string;
  retentionDiscountPercent: number;
  retentionDaysBeforeExpire: number;
}

export interface UserState {
  userId: number;
  telegramId: number;
  level: UserLevel;
  state: UserStateType;
  data?: any;
}

export enum UserStateType {
  NEW = 'NEW',
  FREE_CHOSEN = 'FREE_CHOSEN',
  PAY_CHOSEN = 'PAY_CHOSEN',
  BASE_ACTIVE = 'BASE_ACTIVE',
  BRO_ACTIVE = 'BRO_ACTIVE',
  PRO_ACTIVE = 'PRO_ACTIVE',
  EXPIRED = 'EXPIRED',
  SUPPORT = 'SUPPORT'
}

export interface Material {
  id: number;
  title: string;
  description?: string;
  category: MaterialCategory;
  level: UserLevel;
  url: string;
  isActive: boolean;
}

export interface InviteLinkData {
  link: string;
  level: UserLevel;
  expiresAt?: Date;
  maxUses?: number;
}

export interface SubscriptionData {
  userId: number;
  level: UserLevel;
  tributeId?: string;
  amount?: number;
  currency?: string;
  startDate: Date;
  endDate: Date;
}

export interface RetentionOffer {
  userId: number;
  discountPercent: number;
  originalPrice: number;
  discountedPrice: number;
  expiresAt: Date;
}

export interface BroadcastMessage {
  text: string;
  parseMode?: 'HTML' | 'Markdown';
  replyMarkup?: any;
  targetLevel?: UserLevel;
  targetUsers?: number[];
}

export interface AdminCommand {
  command: string;
  description: string;
  handler: (ctx: any, args: string[]) => Promise<void>;
  requiresAdmin: boolean;
}

export interface TributeWebhookData {
  subscription_id: string;
  user_id: string;
  status: 'active' | 'cancelled' | 'expired';
  amount: number;
  currency: string;
  start_date: string;
  end_date: string;
  level: string;
}

export interface UserAnalytics {
  totalUsers: number;
  activeUsers: number;
  newUsersToday: number;
  conversionRates: {
    freeToBase: number;
    baseToBro: number;
    broToPro: number;
  };
  retentionRates: {
    month1: number;
    month2: number;
    month3: number;
  };
  revenue: {
    total: number;
    monthly: number;
    byLevel: Record<UserLevel, number>;
  };
}

// Types are already exported above
