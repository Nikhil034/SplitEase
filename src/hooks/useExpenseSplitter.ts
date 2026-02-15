"use client";

import { useCallback, useState, useEffect } from "react";
import type { Group, Expense } from "@/types/expense";
import { computeBalances, simplifyToSettlements } from "@/lib/balances";
import {
  getGroups,
  getExpenses,
  setGroups,
  setExpenses,
  generateId,
} from "@/lib/storage";

function loadGroups(): Group[] {
  if (typeof window === "undefined") return [];
  return getGroups();
}

function loadExpenses(): Expense[] {
  if (typeof window === "undefined") return [];
  return getExpenses();
}

export function useExpenseSplitter() {
  const [groups, setGroupsState] = useState<Group[]>([]);
  const [expenses, setExpensesState] = useState<Expense[]>([]);

  useEffect(() => {
    setGroupsState(loadGroups());
    setExpensesState(loadExpenses());
  }, []);

  const persistGroups = useCallback((next: Group[]) => {
    setGroups(next);
    setGroupsState(next);
  }, []);

  const persistExpenses = useCallback((next: Expense[]) => {
    setExpenses(next);
    setExpensesState(next);
  }, []);

  const addGroup = useCallback(
    (name: string, initialMemberIds: string[] = []) => {
      const group: Group = {
        id: generateId(),
        name,
        memberIds: [...initialMemberIds],
        createdAt: Date.now(),
      };
      const next = [...groups, group];
      persistGroups(next);
      return group.id;
    },
    [groups, persistGroups]
  );

  const addMemberToGroup = useCallback(
    (groupId: string, memberId: string) => {
      const g = groups.find((x) => x.id === groupId);
      if (!g || g.memberIds.includes(memberId)) return;
      const next = groups.map((gr) =>
        gr.id === groupId
          ? { ...gr, memberIds: [...gr.memberIds, memberId] }
          : gr
      );
      persistGroups(next);
    },
    [groups, persistGroups]
  );

  const removeMemberFromGroup = useCallback(
    (groupId: string, memberId: string) => {
      const next = groups.map((g) =>
        g.id === groupId
          ? { ...g, memberIds: g.memberIds.filter((id) => id !== memberId) }
          : g
      );
      persistGroups(next);
    },
    [groups, persistGroups]
  );

  const deleteGroup = useCallback(
    (groupId: string) => {
      persistGroups(groups.filter((g) => g.id !== groupId));
      persistExpenses(expenses.filter((e) => e.groupId !== groupId));
    },
    [groups, expenses, persistGroups, persistExpenses]
  );

  const addExpense = useCallback(
    (
      groupId: string,
      amount: number,
      description: string,
      paidByMemberId: string,
      splitBetweenMemberIds: string[]
    ) => {
      const expense: Expense = {
        id: generateId(),
        groupId,
        amount,
        description,
        paidByMemberId,
        splitBetweenMemberIds,
        createdAt: Date.now(),
      };
      persistExpenses([...expenses, expense]);
    },
    [expenses, persistExpenses]
  );

  const getGroupExpenses = useCallback(
    (groupId: string) => expenses.filter((e) => e.groupId === groupId),
    [expenses]
  );

  const getGroupBalances = useCallback(
    (groupId: string) => {
      const g = groups.find((x) => x.id === groupId);
      if (!g) return [];
      const groupExpenses = expenses.filter((e) => e.groupId === groupId);
      return computeBalances(groupExpenses, g.memberIds);
    },
    [groups, expenses]
  );

  const getSettlements = useCallback(
    (groupId: string) => {
      const edges = (() => {
        const g = groups.find((x) => x.id === groupId);
        if (!g) return [];
        const groupExpenses = expenses.filter((e) => e.groupId === groupId);
        return computeBalances(groupExpenses, g.memberIds);
      })();
      return simplifyToSettlements(edges);
    },
    [groups, expenses]
  );

  return {
    groups,
    expenses,
    addGroup,
    addMemberToGroup,
    removeMemberFromGroup,
    deleteGroup,
    addExpense,
    getGroupExpenses,
    getGroupBalances,
    getSettlements,
  };
}
