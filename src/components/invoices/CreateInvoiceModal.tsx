"use client";

import { useState } from "react";
import { Modal } from "../Modal";
import { Input } from "../Input";
import { LiquidGlassButton } from "../LiquidGlassButton";

interface CreateInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (data: {
    recipientId: string;
    amount: number;
    description: string;
    memo: string;
    dueAt?: number;
  }) => void;
}

export function CreateInvoiceModal({
  isOpen,
  onClose,
  onCreate,
}: CreateInvoiceModalProps) {
  const [recipientId, setRecipientId] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [memo, setMemo] = useState("");
  const [dueDate, setDueDate] = useState("");

  const handleSubmit = () => {
    const num = parseFloat(amount);
    if (!recipientId.trim() || !Number.isFinite(num) || num <= 0) return;
    const dueAt = dueDate
      ? new Date(dueDate).getTime()
      : undefined;
    onCreate({
      recipientId: recipientId.trim(),
      amount: num,
      description: description.trim() || "Invoice",
      memo: memo.trim() || description.trim() || `Invoice-${Date.now()}`,
      dueAt,
    });
    setRecipientId("");
    setAmount("");
    setDescription("");
    setMemo("");
    setDueDate("");
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create invoice">
      <div className="space-y-4">
        <Input
          label="Recipient (email or phone)"
          value={recipientId}
          onChange={setRecipientId}
          placeholder="client@example.com"
          onEnter={handleSubmit}
        />
        <Input
          label="Amount"
          type="number"
          value={amount}
          onChange={setAmount}
          placeholder="0.00"
          onEnter={handleSubmit}
        />
        <Input
          label="Description"
          value={description}
          onChange={setDescription}
          placeholder="Consulting, Project fee..."
          onEnter={handleSubmit}
        />
        <Input
          label="Memo (for payment reconciliation)"
          value={memo}
          onChange={setMemo}
          placeholder="e.g. Invoice #123 - client pays with this memo"
          onEnter={handleSubmit}
        />
        <div>
          <label
            className="text-xs tracking-widest uppercase mb-2 block"
            style={{ color: "var(--text-tertiary)" }}
          >
            Due date (optional)
          </label>
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="w-full rounded-md px-3 py-2 text-sm font-mono outline-none"
            style={{
              background: "var(--glass-bg)",
              border: "1px solid var(--glass-border)",
              color: "var(--text-primary)",
            }}
          />
        </div>
        <LiquidGlassButton onClick={handleSubmit} fullWidth className="py-3">
          <span className="uppercase tracking-wider">Create invoice</span>
        </LiquidGlassButton>
      </div>
    </Modal>
  );
}
