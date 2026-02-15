"use client";

import type { Invoice } from "@/types/splitEase";
import { Modal } from "../Modal";

interface InvoiceReceiptProps {
  invoice: Invoice;
  isOpen: boolean;
  onClose: () => void;
  symbol?: string;
}

export function InvoiceReceipt({
  invoice,
  isOpen,
  onClose,
  symbol = "aUSD",
}: InvoiceReceiptProps) {
  const date = new Date(invoice.createdAt).toLocaleDateString(undefined, {
    dateStyle: "medium",
  });
  const dueStr = invoice.dueAt
    ? new Date(invoice.dueAt).toLocaleDateString(undefined, { dateStyle: "medium" })
    : null;
  const paidStr = invoice.paidAt
    ? new Date(invoice.paidAt).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })
    : null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Receipt">
      <div
        className="rounded-lg p-6 space-y-4"
        style={{
          background: "var(--glass-bg)",
          border: "1px solid var(--glass-border)",
        }}
      >
        <div className="flex justify-between items-start">
          <span className="text-xs uppercase tracking-wider" style={{ color: "var(--text-tertiary)" }}>
            Status
          </span>
          <span
            className="text-sm font-medium"
            style={{
              color:
                invoice.status === "paid"
                  ? "var(--accent-success-solid)"
                  : invoice.status === "overdue"
                    ? "#ef4444"
                    : "var(--text-secondary)",
            }}
          >
            {invoice.status}
          </span>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wider mb-1" style={{ color: "var(--text-tertiary)" }}>
            Description
          </p>
          <p className="text-sm" style={{ color: "var(--text-primary)" }}>
            {invoice.description}
          </p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wider mb-1" style={{ color: "var(--text-tertiary)" }}>
            Amount
          </p>
          <p className="text-lg font-mono" style={{ color: "var(--text-primary)" }}>
            {symbol} {invoice.amount.toFixed(2)}
          </p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wider mb-1" style={{ color: "var(--text-tertiary)" }}>
            To
          </p>
          <p className="text-sm font-mono" style={{ color: "var(--text-secondary)" }}>
            {invoice.recipientId}
          </p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wider mb-1" style={{ color: "var(--text-tertiary)" }}>
            Memo (for payment)
          </p>
          <p className="text-sm font-mono break-all" style={{ color: "var(--text-primary)" }}>
            {invoice.memo || "—"}
          </p>
        </div>
        <div className="text-xs space-y-1" style={{ color: "var(--text-tertiary)" }}>
          <p>Created: {date}</p>
          {dueStr && <p>Due: {dueStr}</p>}
          {paidStr && <p>Paid: {paidStr}</p>}
          {invoice.paidTxHash && (
            <a
              href={`https://explore.tempo.xyz/tx/${invoice.paidTxHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="block truncate hover:underline"
              style={{ color: "var(--accent-primary-solid)" }}
            >
              View transaction →
            </a>
          )}
        </div>
      </div>
    </Modal>
  );
}
