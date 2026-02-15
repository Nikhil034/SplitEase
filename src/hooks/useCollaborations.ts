"use client";

import { useCallback, useState, useEffect } from "react";
import type { Collaboration } from "@/types/splitEase";
import {
  getCollaborations,
  setCollaborations,
  generateId,
} from "@/lib/storage";

export function useCollaborations() {
  const [list, setList] = useState<Collaboration[]>([]);

  useEffect(() => {
    setList(getCollaborations());
  }, []);

  const addCollaboration = useCallback(
    (
      name: string,
      totalAmount: number,
      splits: { memberId: string; sharePercent: number }[]
    ) => {
      const withAmounts = splits.map((s) => ({
        memberId: s.memberId,
        sharePercent: s.sharePercent,
        amount: (totalAmount * s.sharePercent) / 100,
      }));
      const c: Collaboration = {
        id: generateId(),
        name,
        totalAmount,
        currency: "aUSD",
        splits: withAmounts,
        createdAt: Date.now(),
      };
      const next = [c, ...getCollaborations()];
      setCollaborations(next);
      setList(next);
    },
    []
  );

  return { collaborations: list, addCollaboration };
}
