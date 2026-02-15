"use client";

import { useMemo } from "react";
import type { ActionLogEntry } from "@/types/splitEase";

interface AnalysisSectionProps {
  actionLog: ActionLogEntry[];
  transactions: { type: string; amount: string }[];
  symbol?: string;
}

function formatActionType(type: string): string {
  return type.replace(/_/g, " ");
}

function formatTime(ts: number): string {
  const d = new Date(ts);
  const now = Date.now();
  const diff = now - ts;
  if (diff < 60000) return "Just now";
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return d.toLocaleDateString(undefined, { dateStyle: "short", timeStyle: "short" });
}

export function AnalysisSection({
  actionLog,
  transactions,
  symbol = "aUSD",
}: AnalysisSectionProps) {
  const stats = useMemo(() => {
    const sent = transactions
      .filter((t) => t.type === "send")
      .reduce((s, t) => s + parseFloat(t.amount || "0"), 0);
    const received = transactions
      .filter((t) => t.type === "receive")
      .reduce((s, t) => s + parseFloat(t.amount || "0"), 0);
    return { sent, received };
  }, [transactions]);

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-light" style={{ color: "var(--text-primary)" }}>
        Analysis
      </h2>
      <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
        Summary of your splits and activity.
      </p>

      <div
        className="rounded-lg p-4 grid grid-cols-2 gap-4"
        style={{
          background: "var(--glass-bg)",
          border: "1px solid var(--glass-border)",
        }}
      >
        <div>
          <p className="text-xs uppercase tracking-wider mb-1" style={{ color: "var(--text-tertiary)" }}>
            Total sent
          </p>
          <p className="text-lg font-mono" style={{ color: "var(--text-primary)" }}>
            {symbol} {stats.sent.toFixed(2)}
          </p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wider mb-1" style={{ color: "var(--text-tertiary)" }}>
            Total received
          </p>
          <p className="text-lg font-mono" style={{ color: "var(--accent-success-solid)" }}>
            {symbol} {stats.received.toFixed(2)}
          </p>
        </div>
      </div>

      <div>
        <p className="text-xs uppercase tracking-wider mb-2" style={{ color: "var(--text-tertiary)" }}>
          Recent activity
        </p>
        {actionLog.length === 0 ? (
          <p className="text-sm py-4 text-center rounded-lg" style={{ color: "var(--text-tertiary)", background: "var(--glass-bg)", border: "1px solid var(--glass-border)" }}>
            No activity logged yet
          </p>
        ) : (
          <ul className="space-y-2 max-h-64 overflow-y-auto">
            {actionLog.slice(0, 50).map((entry) => (
              <li
                key={entry.id}
                className="rounded-lg p-3 flex justify-between items-center text-sm"
                style={{
                  background: "var(--glass-bg)",
                  border: "1px solid var(--glass-border)",
                }}
              >
                <div>
                  <span className="capitalize" style={{ color: "var(--text-primary)" }}>
                    {formatActionType(entry.type)}
                  </span>
                  {entry.memo && (
                    <span className="ml-2 truncate max-w-[120px] inline-block align-bottom" style={{ color: "var(--text-tertiary)" }}>
                      {entry.memo}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {entry.amount != null && (
                    <span className="font-mono" style={{ color: "var(--text-secondary)" }}>
                      {entry.symbol ?? symbol} {Number(entry.amount).toFixed(2)}
                    </span>
                  )}
                  <span className="text-xs" style={{ color: "var(--text-tertiary)" }}>
                    {formatTime(entry.timestamp)}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
