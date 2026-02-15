"use client";

import { useState } from "react";
import { motion } from "motion/react";
import type { Group } from "@/types/expense";
import { LiquidGlassButton } from "../LiquidGlassButton";
import { AddGroupModal } from "./AddGroupModal";
import { GroupDetail } from "./GroupDetail";

interface ExpenseGroupsListProps {
  groups: Group[];
  currentUserMemberId: string;
  getGroupExpenses: (groupId: string) => { id: string; amount: number; description: string; paidByMemberId: string; splitBetweenMemberIds: string[] }[];
  getGroupBalances: (groupId: string) => { fromMemberId: string; toMemberId: string; amount: number }[];
  getSettlements: (groupId: string) => { fromMemberId: string; toMemberId: string; amount: number; memo: string }[];
  onAddGroup: (name: string, memberIds: string[]) => void;
  onAddMember: (groupId: string, memberId: string) => void;
  onAddExpense: (
    groupId: string,
    amount: number,
    description: string,
    paidBy: string,
    splitBetween: string[]
  ) => void;
  onSettle: (toIdentifier: string, amount: string, memo: string) => void;
  isSending?: boolean;
  sendError?: string | null;
  sendTxHash?: string | null;
  onSendReset?: () => void;
}

export function ExpenseGroupsList({
  groups,
  currentUserMemberId,
  getGroupExpenses,
  getGroupBalances,
  getSettlements,
  onAddGroup,
  onAddMember,
  onAddExpense,
  onSettle,
  isSending,
  sendError,
  sendTxHash,
  onSendReset,
}: ExpenseGroupsListProps) {
  const [showAddGroup, setShowAddGroup] = useState(false);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);

  const selectedGroup = selectedGroupId
    ? groups.find((g) => g.id === selectedGroupId)
    : null;

  if (selectedGroup) {
    return (
      <GroupDetail
        group={selectedGroup}
        currentUserMemberId={currentUserMemberId}
        expenses={getGroupExpenses(selectedGroup.id)}
        balances={getGroupBalances(selectedGroup.id)}
        settlements={getSettlements(selectedGroup.id)}
        onAddExpense={(amount, description, paidBy, splitBetween) =>
          onAddExpense(selectedGroup.id, amount, description, paidBy, splitBetween)
        }
        onAddMember={(memberId) => onAddMember(selectedGroup.id, memberId)}
        onBack={() => setSelectedGroupId(null)}
        onSettle={onSettle}
        isSending={isSending}
        sendError={sendError}
        sendTxHash={sendTxHash}
        onSendReset={onSendReset}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2
          className="text-xl font-light"
          style={{ color: "var(--text-primary)" }}
        >
          Expense groups
        </h2>
        <button
          onClick={() => setShowAddGroup(true)}
          className="text-sm uppercase tracking-wider"
          style={{ color: "var(--accent-primary-solid)" }}
        >
          + New group
        </button>
      </div>

      <p
        className="text-sm"
        style={{ color: "var(--text-secondary)" }}
      >
        Split bills with friends. Invite by email or phone—they receive payments on Tempo with one tap.
      </p>
      {!currentUserMemberId && (
        <p
          className="text-xs rounded-lg p-3"
          style={{
            color: "var(--text-tertiary)",
            background: "rgba(255,255,255,0.05)",
            border: "1px solid var(--glass-border)",
          }}
        >
          Sign in with email or phone (not only wallet) so you appear as a member in groups and can settle with one tap.
        </p>
      )}

      {groups.length === 0 ? (
        <div
          className="rounded-lg p-8 text-center"
          style={{
            background: "var(--glass-bg)",
            border: "1px solid var(--glass-border)",
          }}
        >
          <p
            className="text-sm mb-4"
            style={{ color: "var(--text-tertiary)" }}
          >
            No groups yet
          </p>
          <LiquidGlassButton onClick={() => setShowAddGroup(true)}>
            <span className="uppercase tracking-wider">Create your first group</span>
          </LiquidGlassButton>
        </div>
      ) : (
        <ul className="space-y-3">
          {groups.map((g) => (
            <motion.li
              key={g.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-lg overflow-hidden"
              style={{
                background: "var(--glass-bg)",
                border: "1px solid var(--glass-border)",
              }}
            >
              <button
                type="button"
                onClick={() => setSelectedGroupId(g.id)}
                className="w-full px-4 py-4 text-left flex justify-between items-center hover:bg-white/5 transition-colors"
              >
                <span className="font-medium" style={{ color: "var(--text-primary)" }}>
                  {g.name}
                </span>
                <span
                  className="text-xs"
                  style={{ color: "var(--text-tertiary)" }}
                >
                  {g.memberIds.length} member{g.memberIds.length !== 1 ? "s" : ""}
                </span>
              </button>
            </motion.li>
          ))}
        </ul>
      )}

      <AddGroupModal
        isOpen={showAddGroup}
        onClose={() => setShowAddGroup(false)}
        onCreate={onAddGroup}
      />
    </div>
  );
}
