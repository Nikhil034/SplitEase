"use client";

import { useState } from "react";
import { Modal } from "../Modal";
import { Input } from "../Input";
import { LiquidGlassButton } from "../LiquidGlassButton";

interface AddGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (name: string, memberIds: string[]) => void;
}

export function AddGroupModal({
  isOpen,
  onClose,
  onCreate,
}: AddGroupModalProps) {
  const [name, setName] = useState("");
  const [memberInput, setMemberInput] = useState("");
  const [members, setMembers] = useState<string[]>([]);

  const handleAddMember = () => {
    const id = memberInput.trim();
    if (id && !members.includes(id)) {
      setMembers([...members, id]);
      setMemberInput("");
    }
  };

  const handleCreate = () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    onCreate(trimmed, members);
    setName("");
    setMembers([]);
    setMemberInput("");
    onClose();
  };

  const removeMember = (id: string) => {
    setMembers(members.filter((m) => m !== id));
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="New group">
      <div className="space-y-4">
        <Input
          label="Group name"
          value={name}
          onChange={setName}
          placeholder="e.g. Roommates, Trip to NYC"
          onEnter={handleCreate}
        />
        <div>
          <label
            className="text-xs tracking-widest uppercase mb-2 block"
            style={{ color: "var(--text-tertiary)" }}
          >
            Add members (email or phone)
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={memberInput}
              onChange={(e) => setMemberInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddMember())}
              placeholder="friend@email.com or +1234567890"
              className="flex-1 rounded-md px-3 py-2 text-sm font-mono outline-none"
              style={{
                background: "var(--glass-bg)",
                border: "1px solid var(--glass-border)",
                color: "var(--text-primary)",
              }}
            />
            <button
              type="button"
              onClick={handleAddMember}
              className="px-3 py-2 rounded-md text-sm uppercase tracking-wider"
              style={{
                background: "var(--accent-primary)",
                color: "var(--text-primary)",
              }}
            >
              Add
            </button>
          </div>
          {members.length > 0 && (
            <ul className="mt-2 space-y-1">
              {members.map((m) => (
                <li
                  key={m}
                  className="flex items-center justify-between text-sm py-1"
                  style={{ color: "var(--text-secondary)" }}
                >
                  <span className="font-mono truncate">{m}</span>
                  <button
                    type="button"
                    onClick={() => removeMember(m)}
                    className="text-red-400 hover:underline ml-2"
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
        <LiquidGlassButton onClick={handleCreate} fullWidth className="py-3">
          <span className="uppercase tracking-wider">Create group</span>
        </LiquidGlassButton>
      </div>
    </Modal>
  );
}
