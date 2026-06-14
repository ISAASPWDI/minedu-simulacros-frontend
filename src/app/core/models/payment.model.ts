export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  durationDays: number;
  maxExamsPerDay: number | null;
  features: string;
  isActive: boolean;
}

export interface UserSubscription {
  id: string;
  userId: string;
  planId: string;
  planName: string;
  status: string;
  startsAt: string;
  expiresAt: string;
  paymentReference: string | null;
  createdAt: string;
  isActive: boolean;
}

export interface PaymentOrder {
  id: string;
  userId: string;
  planId: string;
  planName: string;
  amount: number;
  status: string;
  yapeReference: string | null;
  confirmedAt: string | null;
  notes: string | null;
  createdAt: string;
}

export interface YapeQrInfo {
  yape_phone: string;
  yape_name: string;
  yape_qr_url: string;
}
