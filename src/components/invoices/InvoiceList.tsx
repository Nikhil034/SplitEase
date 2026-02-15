"use client";

import { useState } from "react";
import { motion } from "motion/react";
import type { Invoice } from "@/types/splitEase";
import { LiquidGlassButton } from "../LiquidGlassButton";
import { CreateInvoiceModal } from "./CreateInvoiceModal";
import { InvoiceReceipt } from "./InvoiceReceipt";

interface InvoiceListProps {
  invoices: Invoice[];
  onAddInvoice: (data: {
    recipientId: string;
    amount: number;
    description: string;
    memo: string;
    dueAt?: number;
  }) => void;
  symbol?: string;
}

export function InvoiceList({
  invoices,
  onAddInvoice,
  symbol = "aUSD",
}: InvoiceListProps) {
  const [showCreate, setShowCreate] = useState(false);
  const [receiptInvoice, setReceiptInvoice] = useState<Invoice | null>(null);

  const pending = invoices.filter((i) => i.status === "pending");
  const paid = invoices.filter((i) => i.status === "paid");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-light" style={{ color: "var(--text-primary)" }}>
          Invoices & receipts
        </h2>
        <button
          type="button"
          onClick={() => setShowCreate(true)}
          className="text-sm uppercase tracking-wider"
          style={{ color: "var(--accent-primary-solid)" }}
        >
          + New invoice
        </button>
      </div>
      <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
        Create invoices with a memo. When the client pays with that memo, we match it and mark the invoice as paid.
      </p>

      {invoices.length === 0 ? (
        <div
          className="rounded-lg p-6 text-center"
          style={{
            background: "var(--glass-bg)",
            border: "1px solid var(--glass-border)",
          }}
        >
          <p className="text-sm mb-4" style={{ color: "var(--text-tertiary)" }}>
            No invoices yet
          </p>
          <LiquidGlassButton onClick={() => setShowCreate(true)}>
            <span className="uppercase tracking-wider">Create first invoice</span>
          </LiquidGlassButton>
        </div>
      ) : (
        <>
          {pending.length > 0 && (
            <div>
              <p className="text-xs uppercase tracking-wider mb-2" style={{ color: "var(--text-tertiary)" }}>
                Pending
              </p>
              <ul className="space-y-2">
                {pending.map((inv) => (
                  <motion.li
                    key={inv.id}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-lg p-4 flex justify-between items-center"
                    style={{
                      background: "var(--glass-bg)",
                      border: "1px solid var(--glass-border)",
                    }}
                  >
                    <div>
                      <p className="text-sm" style={{ color: "var(--text-primary)" }}>
                        {inv.description}
                      </p>
                      <p className="text-xs mt-0.5" style={{ color: "var(--text-tertiary)" }}>
                        {inv.recipientId} · Memo: {inv.memo || "—"}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-mono" style={{ color: "var(--text-secondary)" }}>
                        {symbol} {inv.amount.toFixed(2)}
                      </span>
                      <button
                        type="button"
                        onClick={() => setReceiptInvoice(inv)}
                        className="text-xs uppercase"
                        style={{ color: "var(--accent-primary-solid)" }}
                      >
                        Receipt
                      </button>
                    </div>
                  </motion.li>
                ))}
              </ul>
            </div>
          )}
          {paid.length > 0 && (
            <div>
              <p className="text-xs uppercase tracking-wider mb-2" style={{ color: "var(--text-tertiary)" }}>
                Paid (receipts)
              </p>
              <ul className="space-y-2">
                {paid.map((inv) => (
                  <motion.li
                    key={inv.id}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-lg p-4 flex justify-between items-center"
                    style={{
                      background: "var(--glass-bg)",
                      border: "1px solid var(--glass-border)",
                    }}
                  >
                    <div>
                      <p className="text-sm" style={{ color: "var(--text-primary)" }}>
                        {inv.description}
                      </p>
                      <p className="text-xs mt-0.5" style={{ color: "var(--text-tertiary)" }}>
                        {inv.recipientId}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className="text-xs"
                        style={{ color: "var(--accent-success-solid)" }}
                      >
                        Paid
                      </span>
                      <span className="text-sm font-mono" style={{ color: "var(--text-secondary)" }}>
                        {symbol} {inv.amount.toFixed(2)}
                      </span>
                      <button
                        type="button"
                        onClick={() => setReceiptInvoice(inv)}
                        className="text-xs uppercase"
                        style={{ color: "var(--accent-primary-solid)" }}
                      >
                        Receipt
                      </button>
                    </div>
                  </motion.li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}

      <CreateInvoiceModal
        isOpen={showCreate}
        onClose={() => setShowCreate(false)}
        onCreate={(data) => {
          onAddInvoice(data);
          setShowCreate(false);
        }}
      />
      {receiptInvoice && (
        <InvoiceReceipt
          invoice={receiptInvoice}
          isOpen={!!receiptInvoice}
          onClose={() => setReceiptInvoice(null)}
          symbol={symbol}
        />
      )}
    </div>
  );
}
