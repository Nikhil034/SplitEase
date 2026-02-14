import type { Expense, BalanceEdge, Settlement } from "@/types/expense";

/**
 * Compute net balances: for each pair (from, to), amount that "from" owes "to".
 * Positive amount = from owes to.
 */
export function computeBalances(
  expenses: Expense[],
  memberIds: string[]
): BalanceEdge[] {
  const net: Map<string, Map<string, number>> = new Map();

  function ensure(from: string, to: string): number {
    if (!net.has(from)) net.set(from, new Map());
    const row = net.get(from)!;
    if (!row.has(to)) row.set(to, 0);
    return row.get(to)!;
  }

  function add(from: string, to: string, delta: number) {
    if (from === to) return;
    const current = ensure(from, to);
    net.get(from)!.set(to, current + delta);
  }

  for (const exp of expenses) {
    const { amount, paidByMemberId, splitBetweenMemberIds } = exp;
    const share = amount / splitBetweenMemberIds.length;
    for (const memberId of splitBetweenMemberIds) {
      if (memberId === paidByMemberId) continue;
      add(memberId, paidByMemberId, share);
    }
  }

  // Simplify: for each pair (A,B) and (B,A), cancel and keep one direction
  const edges: BalanceEdge[] = [];
  const seen = new Set<string>();

  for (const from of memberIds) {
    for (const to of memberIds) {
      if (from === to) continue;
      const key = [from, to].sort().join("|");
      if (seen.has(key)) continue;
      seen.add(key);
      const aToB = ensure(from, to);
      const bToA = ensure(to, from);
      const netAmount = aToB - bToA;
      if (netAmount > 0) {
        edges.push({ fromMemberId: from, toMemberId: to, amount: netAmount });
      } else if (netAmount < 0) {
        edges.push({
          fromMemberId: to,
          toMemberId: from,
          amount: -netAmount,
        });
      }
    }
  }

  return edges;
}

/**
 * Simplify debts to minimal number of settlements (greedy).
 * Returns list of (from, to, amount) so that after these transfers everyone is square.
 */
export function simplifyToSettlements(
  edges: BalanceEdge[]
): Settlement[] {
  // Build net balance per person: positive = they are owed, negative = they owe
  const balance = new Map<string, number>();
  for (const e of edges) {
    balance.set(e.fromMemberId, (balance.get(e.fromMemberId) ?? 0) - e.amount);
    balance.set(e.toMemberId, (balance.get(e.toMemberId) ?? 0) + e.amount);
  }

  const debtors = Array.from(balance.entries())
    .filter(([, v]) => v < -1e-6)
    .map(([id]) => ({ id, amount: -balance.get(id)! }));
  const creditors = Array.from(balance.entries())
    .filter(([, v]) => v > 1e-6)
    .map(([id]) => ({ id, amount: balance.get(id)! }));

  const settlements: Settlement[] = [];
  let i = 0;
  let j = 0;
  while (i < debtors.length && j < creditors.length) {
    const d = debtors[i];
    const c = creditors[j];
    const pay = Math.min(d.amount, c.amount);
    if (pay >= 1e-6) {
      settlements.push({
        fromMemberId: d.id,
        toMemberId: c.id,
        amount: pay,
        memo: "Expense settlement",
      });
      d.amount -= pay;
      c.amount -= pay;
    }
    if (d.amount < 1e-6) i++;
    if (c.amount < 1e-6) j++;
  }
  return settlements;
}
