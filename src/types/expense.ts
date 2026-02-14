/**
 * Expense splitter types (Splitwise-style).
 * Members are identified by email or phone (Privy lookup).
 */

export interface Group {
  id: string;
  name: string;
  memberIds: string[]; // email or phone
  createdAt: number;
}

export interface Expense {
  id: string;
  groupId: string;
  amount: number; // in USD / aUSD units
  description: string;
  paidByMemberId: string;
  splitBetweenMemberIds: string[]; // who shares this expense
  createdAt: number;
}

/** Net amount that debtor owes creditor (positive = debtor owes creditor) */
export interface BalanceEdge {
  fromMemberId: string;
  toMemberId: string;
  amount: number;
}

/** Simplified settlement: one person pays another one amount */
export interface Settlement {
  fromMemberId: string;
  toMemberId: string;
  amount: number;
  memo: string;
}
