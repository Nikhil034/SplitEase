"use client";

import { useState } from "react";
import { Modal, Input, LiquidGlassButton } from "@/components";
import { generateId } from "@/lib/storage";
import type { Game } from "@/types/game";

interface CreateGameModalProps {
    isOpen: boolean;
    onClose: () => void;
    onCreateGame: (game: Game) => void;
    hostWalletAddress: string;
    hostMemberId: string;
}

export function CreateGameModal({
    isOpen,
    onClose,
    onCreateGame,
    hostWalletAddress,
    hostMemberId,
}: CreateGameModalProps) {
    const [entryFee, setEntryFee] = useState("");
    const [maxPlayers, setMaxPlayers] = useState("4");
    const [minPlayers, setMinPlayers] = useState("2");

    const handleCreate = () => {
        if (!entryFee || parseFloat(entryFee) <= 0) {
            alert("Please enter a valid entry fee");
            return;
        }

        const max = parseInt(maxPlayers);
        const min = parseInt(minPlayers);

        if (max < min || min < 2) {
            alert("Min players must be at least 2 and max must be >= min");
            return;
        }

        const gameId = generateId();
        const game: Game = {
            id: gameId,
            hostId: hostWalletAddress,
            hostMemberId,
            entryFee: parseFloat(entryFee),
            maxPlayers: max,
            minPlayers: min,
            createdAt: Date.now(),
            status: "waiting",
            players: [],
        };

        onCreateGame(game);
        setEntryFee("");
        setMaxPlayers("4");
        setMinPlayers("2");
        onClose();
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Create Pot Luck Game"
        >
            <div className="space-y-4">
                <div>
                    <label
                        className="block text-xs mb-2 uppercase tracking-wider"
                        style={{ color: "var(--text-tertiary)" }}
                    >
                        Entry Fee (alphaUSD)
                    </label>
                    <Input
                        type="number"
                        value={entryFee}
                        onChange={setEntryFee}
                        placeholder="5.00"
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label
                            className="block text-xs mb-2 uppercase tracking-wider"
                            style={{ color: "var(--text-tertiary)" }}
                        >
                            Min Players
                        </label>
                        <Input
                            type="number"
                            value={minPlayers}
                            onChange={setMinPlayers}
                            placeholder="2"
                        />
                    </div>

                    <div>
                        <label
                            className="block text-xs mb-2 uppercase tracking-wider"
                            style={{ color: "var(--text-tertiary)" }}
                        >
                            Max Players
                        </label>
                        <Input
                            type="number"
                            value={maxPlayers}
                            onChange={setMaxPlayers}
                            placeholder="4"
                        />
                    </div>
                </div>

                <LiquidGlassButton onClick={handleCreate} fullWidth={true}>
                    Create Game
                </LiquidGlassButton>
            </div>
        </Modal>
    );
}
