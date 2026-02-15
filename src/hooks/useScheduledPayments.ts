"use client";

import { useCallback, useState, useEffect } from "react";
import type { ScheduledPayment } from "@/types/splitEase";
import {
  getScheduledPayments,
  setScheduledPayments,
  generateId,
} from "@/lib/storage";

const POLL_MS = 60 * 1000; // 1 minute

export function useScheduledPayments(
  executePayment: (to: string, amount: string, memo: string) => Promise<void>
) {
  const [list, setList] = useState<ScheduledPayment[]>([]);

  const refresh = useCallback(() => {
    setList(getScheduledPayments());
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    const scheduled = getScheduledPayments();
    const due = scheduled.filter(
      (s) => s.status === "scheduled" && s.executeAt <= Date.now()
    );
    if (due.length === 0) return;

    let cancelled = false;
    (async () => {
      for (const s of due) {
        if (cancelled) break;
        const payments = getScheduledPayments();
        const item = payments.find((p) => p.id === s.id);
        if (!item || item.status !== "scheduled") continue;
        try {
          await executePayment(
            item.toIdentifier,
            item.amount.toFixed(2),
            item.memo
          );
          const updated = getScheduledPayments().map((p) =>
            p.id === item.id
              ? {
                  ...p,
                  status: "executed" as const,
                  executedAt: Date.now(),
                  txHash: undefined, // could pass from executePayment if hook returns txHash
                }
              : p
          );
          setScheduledPayments(updated);
          setList(updated);
        } catch (err) {
          const updated = getScheduledPayments().map((p) =>
            p.id === item.id
              ? {
                  ...p,
                  status: "failed" as const,
                  error: err instanceof Error ? err.message : "Failed",
                }
              : p
          );
          setScheduledPayments(updated);
          setList(updated);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [list, executePayment]);

  useEffect(() => {
    const interval = setInterval(() => {
      refresh();
    }, POLL_MS);
    return () => clearInterval(interval);
  }, [refresh]);

  const addScheduled = useCallback(
    (toIdentifier: string, amount: number, memo: string, executeAt: number) => {
      const item: ScheduledPayment = {
        id: generateId(),
        toIdentifier,
        amount,
        memo,
        executeAt,
        status: "scheduled",
        createdAt: Date.now(),
      };
      const next = [item, ...getScheduledPayments()];
      setScheduledPayments(next);
      setList(next);
      return item.id;
    },
    []
  );

  const cancelScheduled = useCallback((id: string) => {
    const next = getScheduledPayments().map((p) =>
      p.id === id ? { ...p, status: "cancelled" as const } : p
    );
    setScheduledPayments(next);
    setList(next);
  }, []);

  return { list, addScheduled, cancelScheduled, refresh };
}
