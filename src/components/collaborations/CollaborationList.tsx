"use client";

import { useState } from "react";
import { motion } from "motion/react";
import type { Collaboration } from "@/types/splitEase";
import { LiquidGlassButton } from "../LiquidGlassButton";
import { Modal } from "../Modal";
import { Input } from "../Input";

interface CollaborationListProps {
  collaborations: Collaboration[];
  onCreate: (name: string, totalAmount: number, splits: { memberId: string; sharePercent: number }[]) => void;
}

export function CollaborationList({
  collaborations,
  onCreate,
}: CollaborationListProps) {
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState("");
  const [totalAmount, setTotalAmount] = useState("");
  const [members, setMembers] = useState<{ memberId: string; sharePercent: string }[]>([
    { memberId: "", sharePercent: "50" },
    { memberId: "", sharePercent: "50" },
  ]);

  const addMember = () => {
    setMembers([...members, { memberId: "", sharePercent: "0" }]);
  };

  const updateMember = (i: number, field: "memberId" | "sharePercent", value: string) => {
    const next = [...members];
    next[i] = { ...next[i], [field]: value };
    setMembers(next);
  };

  const removeMember = (i: number) => {
    if (members.length <= 1) return;
    setMembers(members.filter((_, idx) => idx !== i));
  };

  const handleCreate = () => {
    const total = parseFloat(totalAmount);
    if (!name.trim() || !Number.isFinite(total) || total <= 0) return;
    const splits = members
      .filter((m) => m.memberId.trim())
      .map((m) => ({
        memberId: m.memberId.trim(),
        sharePercent: Math.max(0, Math.min(100, parseFloat(m.sharePercent) || 0)),
      }));
    const sum = splits.reduce((s, x) => s + x.sharePercent, 0);
    if (sum <= 0) return;
    const normalized = splits.map((s) => ({
      ...s,
      sharePercent: (s.sharePercent / sum) * 100,
    }));
    const withAmounts = normalized.map((s) => ({
      memberId: s.memberId,
      sharePercent: s.sharePercent,
      amount: (total * s.sharePercent) / 100,
    }));
    onCreate(name, total, normalized);
    setShowCreate(false);
    setName("");
    setTotalAmount("");
    setMembers([{ memberId: "", sharePercent: "50" }, { memberId: "", sharePercent: "50" }]);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-light" style={{ color: "var(--text-primary)" }}>
          Revenue splitting
        </h2>
        <button
          type="button"
          onClick={() => setShowCreate(true)}
          className="text-sm uppercase tracking-wider"
          style={{ color: "var(--accent-primary-solid)" }}
        >
          + New collaboration
        </button>
      </div>
      <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
        Define a project or collaboration with total revenue and split percentages. Track who gets what when you distribute.
      </p>

      {collaborations.length === 0 ? (
        <div
          className="rounded-lg p-6 text-center"
          style={{
            background: "var(--glass-bg)",
            border: "1px solid var(--glass-border)",
          }}
        >
          <p className="text-sm mb-4" style={{ color: "var(--text-tertiary)" }}>
            No collaborations yet
          </p>
          <LiquidGlassButton onClick={() => setShowCreate(true)}>
            <span className="uppercase tracking-wider">Create collaboration</span>
          </LiquidGlassButton>
        </div>
      ) : (
        <ul className="space-y-3">
          {collaborations.map((c) => (
            <motion.li
              key={c.id}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-lg p-4"
              style={{
                background: "var(--glass-bg)",
                border: "1px solid var(--glass-border)",
              }}
            >
              <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                {c.name}
              </p>
              <p className="text-xs mt-1" style={{ color: "var(--text-tertiary)" }}>
                Total: {c.currency} {c.totalAmount.toFixed(2)}
              </p>
              <ul className="mt-2 space-y-1">
                {c.splits.map((s, i) => (
                  <li
                    key={i}
                    className="text-xs flex justify-between"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    <span className="font-mono truncate">{s.memberId}</span>
                    <span>{s.sharePercent.toFixed(0)}% · {s.amount.toFixed(2)}</span>
                  </li>
                ))}
              </ul>
            </motion.li>
          ))}
        </ul>
      )}

      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="New collaboration">
        <div className="space-y-4">
          <Input
            label="Project name"
            value={name}
            onChange={setName}
            placeholder="e.g. Podcast Q1"
            onEnter={handleCreate}
          />
          <Input
            label="Total revenue amount"
            type="number"
            value={totalAmount}
            onChange={setTotalAmount}
            placeholder="0.00"
            onEnter={handleCreate}
          />
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs tracking-widest uppercase" style={{ color: "var(--text-tertiary)" }}>
                Splits (email/phone · %)
              </span>
              <button
                type="button"
                onClick={addMember}
                className="text-xs uppercase"
                style={{ color: "var(--accent-primary-solid)" }}
              >
                + Add
              </button>
            </div>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {members.map((m, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <input
                    type="text"
                    value={m.memberId}
                    onChange={(e) => updateMember(i, "memberId", e.target.value)}
                    placeholder="email or phone"
                    className="flex-1 rounded px-2 py-1.5 text-sm font-mono outline-none"
                    style={{
                      background: "var(--glass-bg)",
                      border: "1px solid var(--glass-border)",
                      color: "var(--text-primary)",
                    }}
                  />
                  <input
                    type="number"
                    value={m.sharePercent}
                    onChange={(e) => updateMember(i, "sharePercent", e.target.value)}
                    placeholder="%"
                    className="w-16 rounded px-2 py-1.5 text-sm font-mono outline-none"
                    style={{
                      background: "var(--glass-bg)",
                      border: "1px solid var(--glass-border)",
                      color: "var(--text-primary)",
                    }}
                  />
                  {members.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeMember(i)}
                      className="text-red-400 text-xs"
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
          <LiquidGlassButton onClick={handleCreate} fullWidth className="py-3">
            <span className="uppercase tracking-wider">Create</span>
          </LiquidGlassButton>
        </div>
      </Modal>
    </div>
  );
}
