/**
 * SplitEase extended features: invoices, scheduled payments, collaborations, analytics.
 */

export type InvoiceStatus = "pending" | "paid" | "overdue";

export interface Invoice {
  id: string;
  recipientId: string; // email or phone
  amount: number;
  description: string;
  memo: string; // used for reconciliation when payment received
  status: InvoiceStatus;
  createdAt: number;
  dueAt?: number;
  paidAt?: number;
  paidTxHash?: string;
}

export interface ScheduledPayment {
  id: string;
  toIdentifier: string; // email or phone
  amount: number;
  memo: string;
  executeAt: number; // unix ms
  status: "scheduled" | "executed" | "failed" | "cancelled";
  createdAt: number;
  executedAt?: number;
  txHash?: string;
  error?: string;
}

/** Revenue split: one collaboration project with multiple recipients and shares */
export interface Collaboration {
  id: string;
  name: string;
  totalAmount: number;
  currency: string;
  splits: { memberId: string; sharePercent: number; amount: number }[];
  createdAt: number;
  /** When revenue was distributed (tx hashes per recipient) */
  distributedAt?: number;
  distributionTxHashes?: string[];
}

export type ActionType =
  | "send"
  | "receive"
  | "settle"
  | "batch_send"
  | "invoice_created"
  | "invoice_paid"
  | "scheduled_pay"
  | "collab_distribute"
  | "expense_added"
  | "group_created";

export interface ActionLogEntry {
  id: string;
  type: ActionType;
  timestamp: number;
  amount?: number;
  symbol?: string;
  memo?: string;
  recipientId?: string;
  txHash?: string;
  extra?: Record<string, unknown>;
}
