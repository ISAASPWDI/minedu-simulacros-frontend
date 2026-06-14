export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  durationDays: number;
  features: string[];
  active: boolean;
}

export interface UserSubscription {
  id: string;
  planId: string;
  planName: string;
  startDate: string;
  endDate: string;
  active: boolean;
  daysRemaining: number;
}

export interface PaymentOrder {
  id: string;
  userId: string;
  userName: string;
  planId: string;
  planName: string;
  amount: number;
  status: 'PENDING' | 'CONFIRMED' | 'REJECTED';
  yapeReference?: string;
  notes?: string;
  createdAt: string;
  confirmedAt?: string;
  rejectedAt?: string;
  rejectionReason?: string;
}

export interface YapeQrInfo {
  qrImageUrl: string;
  phone: string;
  holderName: string;
}
