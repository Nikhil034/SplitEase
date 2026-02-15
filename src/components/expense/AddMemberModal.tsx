"use client";

import { useState } from "react";
import { Modal } from "../Modal";
import { Input } from "../Input";
import { LiquidGlassButton } from "../LiquidGlassButton";

interface AddMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (memberId: string) => void;
  existingIds: string[];
}

export function AddMemberModal({
  isOpen,
  onClose,
  onAdd,
  existingIds,
}: AddMemberModalProps) {
  const [value, setValue] = useState("");

  const handleAdd = () => {
    const id = value.trim();
    if (!id || existingIds.includes(id)) return;
    onAdd(id);
    setValue("");
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Invite by email or phone">
      <div className="space-y-4">
        <Input
          label="Email or phone"
          value={value}
          onChange={setValue}
          placeholder="friend@email.com or +1234567890"
          onEnter={handleAdd}
        />
        <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>
          They can sign in with Privy using this email or phone to receive
          payments.
        </p>
        <LiquidGlassButton onClick={handleAdd} fullWidth className="py-3">
          <span className="uppercase tracking-wider">Add member</span>
        </LiquidGlassButton>
      </div>
    </Modal>
  );
}
