"use client";

import { useCallback, useState, useEffect } from "react";
import type { Invoice } from "@/types/splitEase";
import {
  getInvoices,
  setInvoices,
  addInvoice as addInvoiceStorage,
  updateInvoice,
  generateId,
} from "@/lib/storage";

/** Reconcile invoices: mark as paid when a receive tx has matching memo */
function reconcileInvoices(
  invoices: Invoice[],
  receiveTxs: { memo?: string; hash: string; amount: string; timestamp: number }[]
): Invoice[] {
  return invoices.map((inv) => {
    if (inv.status !== "pending" || !inv.memo?.trim()) return inv;
    const memoLower = inv.memo.trim().toLowerCase();
    const match = receiveTxs.find((tx) => {
      const txMemo = (tx.memo ?? "").trim().toLowerCase();
      return txMemo === memoLower || txMemo.includes(memoLower) || memoLower.includes(txMemo);
    });
    if (!match) return inv;
    return {
      ...inv,
      status: "paid" as const,
      paidAt: match.timestamp * 1000,
      paidTxHash: match.hash,
    };
  });
}

export function useInvoices(
  receiveTxs: { memo?: string; hash: string; amount: string; timestamp: number }[]
) {
  const [invoices, setInvoicesState] = useState<Invoice[]>([]);

  useEffect(() => {
    setInvoicesState(getInvoices());
  }, []);

  useEffect(() => {
    if (receiveTxs.length === 0) return;
    const current = getInvoices();
    const reconciled = reconcileInvoices(current, receiveTxs);
    const changed = reconciled.some(
      (r, i) => r.status !== current[i]?.status || r.paidTxHash !== current[i]?.paidTxHash
    );
    if (changed) {
      setInvoices(reconciled);
      setInvoicesState(reconciled);
    }
  }, [receiveTxs]);

  const addInvoice = useCallback(
    (invoice: Omit<Invoice, "id" | "status" | "createdAt">) => {
      const newInv: Invoice = {
        ...invoice,
        id: generateId(),
        status: "pending",
        createdAt: Date.now(),
      };
      addInvoiceStorage(newInv);
      setInvoicesState(getInvoices());
      return newInv.id;
    },
    []
  );

  const refresh = useCallback(() => {
    setInvoicesState(getInvoices());
  }, []);

  return { invoices, addInvoice, refresh };
}
