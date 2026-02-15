"use client";

import { useState } from "react";
import { Modal } from "../Modal";
import { Input } from "../Input";
import { LiquidGlassButton } from "../LiquidGlassButton";

interface AddExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  memberIds: string[];
  currentUserMemberId: string;
  onAdd: (
    amount: number,
    description: string,
    paidByMemberId: string,
    splitBetweenMemberIds: string[]
  ) => void;
}

export function AddExpenseModal({
  isOpen,
  onClose,
  memberIds,
  currentUserMemberId,
  onAdd,
}: AddExpenseModalProps) {
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [paidBy, setPaidBy] = useState(currentUserMemberId);
  const [splitBetween, setSplitBetween] = useState<string[]>(
    memberIds.length ? [...memberIds] : []
  );

  const toggleSplit = (id: string) => {
    setSplitBetween((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleSubmit = () => {
    const num = parseFloat(amount);
    if (!Number.isFinite(num) || num <= 0 || splitBetween.length === 0) return;
    onAdd(num, description.trim() || "Expense", paidBy, splitBetween);
    setAmount("");
    setDescription("");
    setPaidBy(currentUserMemberId);
    setSplitBetween(memberIds.length ? [...memberIds] : []);
    onClose();
  };

  if (memberIds.length === 0) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} title="Add expense">
        <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
          Add at least one member to the group before adding expenses.
        </p>
      </Modal>
    );
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add expense">
      <div className="space-y-4">
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
          placeholder="e.g. Dinner, Uber"
          onEnter={handleSubmit}
        />
        <div>
          <label
            className="text-xs tracking-widest uppercase mb-2 block"
            style={{ color: "var(--text-tertiary)" }}
          >
            Paid by
          </label>
          <select
            value={paidBy}
            onChange={(e) => setPaidBy(e.target.value)}
            className="w-full rounded-md px-3 py-2 text-sm font-mono outline-none"
            style={{
              background: "var(--glass-bg)",
              border: "1px solid var(--glass-border)",
              color: "var(--text-primary)",
            }}
          >
            {memberIds.map((id) => (
              <option key={id} value={id}>
                {id}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label
            className="text-xs tracking-widest uppercase mb-2 block"
            style={{ color: "var(--text-tertiary)" }}
          >
            Split between
          </label>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {memberIds.map((id) => (
              <label
                key={id}
                className="flex items-center gap-2 text-sm cursor-pointer"
                style={{ color: "var(--text-secondary)" }}
              >
                <input
                  type="checkbox"
                  checked={splitBetween.includes(id)}
                  onChange={() => toggleSplit(id)}
                  className="rounded"
                />
                <span className="font-mono truncate">{id}</span>
              </label>
            ))}
          </div>
        </div>
        <LiquidGlassButton onClick={handleSubmit} fullWidth className="py-3">
          <span className="uppercase tracking-wider">Add expense</span>
        </LiquidGlassButton>
      </div>
    </Modal>
  );
}
