"use client";

import { useState } from "react";
import { motion } from "motion/react";
import type { Group } from "@/types/expense";
import { LiquidGlassButton } from "../LiquidGlassButton";
import { AddExpenseModal } from "./AddExpenseModal";
import { AddMemberModal } from "./AddMemberModal";
import { SendModal } from "../SendModal";

interface GroupDetailProps {
  group: Group;
  currentUserMemberId: string;
  expenses: { id: string; amount: number; description: string; paidByMemberId: string; splitBetweenMemberIds: string[] }[];
  balances: { fromMemberId: string; toMemberId: string; amount: number }[];
  settlements: { fromMemberId: string; toMemberId: string; amount: number; memo: string }[];
  onAddExpense: (
    amount: number,
    description: string,
    paidBy: string,
    splitBetween: string[]
  ) => void;
  onAddMember: (memberId: string) => void;
  onBack: () => void;
  onSettle: (toIdentifier: string, amount: string, memo: string) => void;
  isSending?: boolean;
  sendError?: string | null;
  sendTxHash?: string | null;
  onSendReset?: () => void;
}

export function GroupDetail({
  group,
  currentUserMemberId,
  expenses,
  balances,
  settlements,
  onAddExpense,
  onAddMember,
  onBack,
  onSettle,
  isSending,
  sendError,
  sendTxHash,
  onSendReset,
}: GroupDetailProps) {
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [showAddMember, setShowAddMember] = useState(false);
  const [showSettle, setShowSettle] = useState(false);
  const [settleTo, setSettleTo] = useState("");
  const [settleAmount, setSettleAmount] = useState("");
  const [settleMemo, setSettleMemo] = useState("");

  const mySettlements = settlements.filter(
    (s) => s.fromMemberId === currentUserMemberId
  );

  const openSettle = (to: string, amount: number, memo: string) => {
    setSettleTo(to);
    setSettleAmount(amount.toFixed(2));
    setSettleMemo(memo);
    setShowSettle(true);
  };

  const handleSettleConfirm = () => {
    onSettle(settleTo, settleAmount, settleMemo);
    setShowSettle(false);
    setSettleTo("");
    setSettleAmount("");
    setSettleMemo("");
  };

  const handleCloseSettle = () => {
    setShowSettle(false);
    onSendReset?.();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="text-sm flex items-center gap-1"
          style={{ color: "var(--text-secondary)" }}
        >
          <span>←</span> Back
        </button>
      </div>

      <h2
        className="text-xl font-light"
        style={{ color: "var(--text-primary)" }}
      >
        {group.name}
      </h2>

      {/* Members */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span
            className="text-xs tracking-widest uppercase"
            style={{ color: "var(--text-tertiary)" }}
          >
            Members
          </span>
          <button
            onClick={() => setShowAddMember(true)}
            className="text-xs uppercase tracking-wider"
            style={{ color: "var(--accent-primary-solid)" }}
          >
            + Invite
          </button>
        </div>
        <ul
          className="rounded-lg divide-y overflow-hidden"
          style={{
            background: "var(--glass-bg)",
            border: "1px solid var(--glass-border)",
          }}
        >
          {group.memberIds.map((id) => (
            <li
              key={id}
              className="px-4 py-2 text-sm font-mono flex justify-between items-center"
              style={{ color: "var(--text-primary)" }}
            >
              <span className="truncate">{id}</span>
              {id === currentUserMemberId && (
                <span
                  className="text-xs ml-2"
                  style={{ color: "var(--text-tertiary)" }}
                >
                  You
                </span>
              )}
            </li>
          ))}
        </ul>
      </div>

      {/* Expenses */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span
            className="text-xs tracking-widest uppercase"
            style={{ color: "var(--text-tertiary)" }}
          >
            Expenses
          </span>
          <button
            onClick={() => setShowAddExpense(true)}
            className="text-xs uppercase tracking-wider"
            style={{ color: "var(--accent-primary-solid)" }}
          >
            + Add
          </button>
        </div>
        {expenses.length === 0 ? (
          <p
            className="text-sm py-4 text-center rounded-lg"
            style={{
              color: "var(--text-tertiary)",
              background: "var(--glass-bg)",
              border: "1px solid var(--glass-border)",
            }}
          >
            No expenses yet
          </p>
        ) : (
          <ul
            className="rounded-lg divide-y overflow-hidden"
            style={{
              background: "var(--glass-bg)",
              border: "1px solid var(--glass-border)",
            }}
          >
            {expenses.map((e) => (
              <li
                key={e.id}
                className="px-4 py-3 flex justify-between items-center text-sm"
              >
                <span style={{ color: "var(--text-primary)" }}>
                  {e.description || "Expense"}
                </span>
                <span style={{ color: "var(--text-secondary)" }}>
                  ${e.amount.toFixed(2)} · paid by {e.paidByMemberId.split("@")[0] ?? e.paidByMemberId.slice(0, 8)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Balances (who owes whom) */}
      {balances.length > 0 && (
        <div>
          <span
            className="text-xs tracking-widest uppercase block mb-2"
            style={{ color: "var(--text-tertiary)" }}
          >
            Balances
          </span>
          <ul
            className="rounded-lg divide-y overflow-hidden"
            style={{
              background: "var(--glass-bg)",
              border: "1px solid var(--glass-border)",
            }}
          >
            {balances.map((b, i) => (
              <li
                key={`${b.fromMemberId}-${b.toMemberId}-${i}`}
                className="px-4 py-2 flex justify-between items-center text-sm"
              >
                <span style={{ color: "var(--text-secondary)" }}>
                  {b.fromMemberId === currentUserMemberId ? "You" : b.fromMemberId.split("@")[0] ?? b.fromMemberId.slice(0, 10)} owe{" "}
                  {b.toMemberId === currentUserMemberId ? "you" : (b.toMemberId.split("@")[0] ?? b.toMemberId.slice(0, 10))}
                </span>
                <span style={{ color: "var(--text-primary)" }}>
                  ${b.amount.toFixed(2)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Settle (one-tap for current user) */}
      {mySettlements.length > 0 && (
        <div>
          <span
            className="text-xs tracking-widest uppercase block mb-2"
            style={{ color: "var(--text-tertiary)" }}
          >
            You owe
          </span>
          <div className="space-y-2">
            {mySettlements.map((s, i) => (
              <motion.div
                key={`${s.toMemberId}-${i}`}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between p-4 rounded-lg"
                style={{
                  background: "var(--glass-bg)",
                  border: "1px solid var(--glass-border)",
                }}
              >
                <div>
                  <p className="text-sm" style={{ color: "var(--text-primary)" }}>
                    {s.toMemberId}
                  </p>
                  <p
                    className="text-xs mt-0.5"
                    style={{ color: "var(--text-tertiary)" }}
                  >
                    ${s.amount.toFixed(2)}
                  </p>
                </div>
                <LiquidGlassButton
                  onClick={() =>
                    openSettle(s.toMemberId, s.amount, s.memo || "Settlement")
                  }
                  className="py-2 px-4 text-sm"
                >
                  <span className="uppercase tracking-wider">Settle</span>
                </LiquidGlassButton>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      <AddExpenseModal
        isOpen={showAddExpense}
        onClose={() => setShowAddExpense(false)}
        memberIds={group.memberIds}
        currentUserMemberId={currentUserMemberId}
        onAdd={onAddExpense}
      />
      <AddMemberModal
        isOpen={showAddMember}
        onClose={() => setShowAddMember(false)}
        onAdd={onAddMember}
        existingIds={group.memberIds}
      />
      <SendModal
        isOpen={showSettle}
        onClose={handleCloseSettle}
        recipientAddress={settleTo}
        onRecipientChange={setSettleTo}
        amount={settleAmount}
        onAmountChange={setSettleAmount}
        memo={settleMemo}
        onMemoChange={setSettleMemo}
        onConfirm={handleSettleConfirm}
        isSending={isSending}
        error={sendError}
        txHash={sendTxHash}
      />
    </div>
  );
}
