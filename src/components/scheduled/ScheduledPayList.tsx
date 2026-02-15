"use client";

import { useState } from "react";
import { motion } from "motion/react";
import type { ScheduledPayment } from "@/types/splitEase";
import { LiquidGlassButton } from "../LiquidGlassButton";
import { Modal } from "../Modal";
import { Input } from "../Input";

interface ScheduledPayListProps {
  list: ScheduledPayment[];
  onAdd: (toIdentifier: string, amount: number, memo: string, executeAt: number) => void;
  onCancel: (id: string) => void;
}

export function ScheduledPayList({
  list,
  onAdd,
  onCancel,
}: ScheduledPayListProps) {
  const [showAdd, setShowAdd] = useState(false);
  const [toIdentifier, setToIdentifier] = useState("");
  const [amount, setAmount] = useState("");
  const [memo, setMemo] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");

  const handleAdd = () => {
    const num = parseFloat(amount);
    if (!toIdentifier.trim() || !Number.isFinite(num) || num <= 0 || !date || !time) return;
    const executeAt = new Date(`${date}T${time}`).getTime();
    if (executeAt <= Date.now()) return;
    onAdd(toIdentifier.trim(), num, memo.trim() || "Scheduled payment", executeAt);
    setToIdentifier("");
    setAmount("");
    setMemo("");
    setDate("");
    setTime("");
    setShowAdd(false);
  };

  const scheduled = list.filter((s) => s.status === "scheduled");
  const executed = list.filter((s) => s.status === "executed" || s.status === "failed");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-light" style={{ color: "var(--text-primary)" }}>
          Auto pay
        </h2>
        <button
          type="button"
          onClick={() => setShowAdd(true)}
          className="text-sm uppercase tracking-wider"
          style={{ color: "var(--accent-primary-solid)" }}
        >
          + Schedule
        </button>
      </div>
      <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
        Schedule a payment to run automatically at a set date and time. Runs when the app is open (browser tab active).
      </p>

      {list.length === 0 ? (
        <div
          className="rounded-lg p-6 text-center"
          style={{
            background: "var(--glass-bg)",
            border: "1px solid var(--glass-border)",
          }}
        >
          <p className="text-sm mb-4" style={{ color: "var(--text-tertiary)" }}>
            No scheduled payments
          </p>
          <LiquidGlassButton onClick={() => setShowAdd(true)}>
            <span className="uppercase tracking-wider">Schedule payment</span>
          </LiquidGlassButton>
        </div>
      ) : (
        <>
          {scheduled.length > 0 && (
            <div>
              <p className="text-xs uppercase tracking-wider mb-2" style={{ color: "var(--text-tertiary)" }}>
                Upcoming
              </p>
              <ul className="space-y-2">
                {scheduled.map((s) => (
                  <motion.li
                    key={s.id}
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
                        {s.toIdentifier}
                      </p>
                      <p className="text-xs mt-0.5" style={{ color: "var(--text-tertiary)" }}>
                        {new Date(s.executeAt).toLocaleString()} · {s.amount.toFixed(2)} aUSD
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => onCancel(s.id)}
                      className="text-xs uppercase text-red-400 hover:underline"
                    >
                      Cancel
                    </button>
                  </motion.li>
                ))}
              </ul>
            </div>
          )}
          {executed.length > 0 && (
            <div>
              <p className="text-xs uppercase tracking-wider mb-2" style={{ color: "var(--text-tertiary)" }}>
                Past
              </p>
              <ul className="space-y-2">
                {executed.map((s) => (
                  <li
                    key={s.id}
                    className="rounded-lg p-3 text-sm flex justify-between items-center"
                    style={{
                      background: "var(--glass-bg)",
                      border: "1px solid var(--glass-border)",
                    }}
                  >
                    <span style={{ color: "var(--text-secondary)" }}>{s.toIdentifier}</span>
                    <span
                      style={{
                        color: s.status === "executed" ? "var(--accent-success-solid)" : "#ef4444",
                      }}
                    >
                      {s.status}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}

      <Modal isOpen={showAdd} onClose={() => setShowAdd(false)} title="Schedule payment">
        <div className="space-y-4">
          <Input
            label="Recipient (email or phone)"
            value={toIdentifier}
            onChange={setToIdentifier}
            placeholder="friend@example.com"
            onEnter={handleAdd}
          />
          <Input
            label="Amount"
            type="number"
            value={amount}
            onChange={setAmount}
            placeholder="0.00"
            onEnter={handleAdd}
          />
          <Input
            label="Memo"
            value={memo}
            onChange={setMemo}
            placeholder="Optional"
            onEnter={handleAdd}
          />
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs tracking-widest uppercase mb-1 block" style={{ color: "var(--text-tertiary)" }}>
                Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full rounded px-2 py-2 text-sm font-mono outline-none"
                style={{
                  background: "var(--glass-bg)",
                  border: "1px solid var(--glass-border)",
                  color: "var(--text-primary)",
                }}
              />
            </div>
            <div>
              <label className="text-xs tracking-widest uppercase mb-1 block" style={{ color: "var(--text-tertiary)" }}>
                Time
              </label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full rounded px-2 py-2 text-sm font-mono outline-none"
                style={{
                  background: "var(--glass-bg)",
                  border: "1px solid var(--glass-border)",
                  color: "var(--text-primary)",
                }}
              />
            </div>
          </div>
          <LiquidGlassButton onClick={handleAdd} fullWidth className="py-3">
            <span className="uppercase tracking-wider">Schedule</span>
          </LiquidGlassButton>
        </div>
      </Modal>
    </div>
  );
}
