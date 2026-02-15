"use client";

import { GlassCard } from "@/components";
import type { Game } from "@/types/game";
import { motion } from "motion/react";

interface GameCardProps {
    game: Game;
    onClick: () => void;
    isHost: boolean;
}

export function GameCard({ game, onClick, isHost }: GameCardProps) {
    const statusColors = {
        waiting: "var(--accent-warning)",
        active: "var(--accent-success)",
        ended: "var(--text-tertiary)",
    };

    const playerCount = game.players.length;
    const isFull = playerCount >= game.maxPlayers;
    const canStart = playerCount >= game.minPlayers;

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            onClick={onClick}
            className="cursor-pointer"
        >
            <GlassCard>
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                            <h4
                                className="text-sm font-medium"
                                style={{ color: "var(--text-primary)" }}
                            >
                                {isHost ? "Your Game" : "Joined Game"}
                            </h4>
                            <span
                                className="text-xs px-2 py-0.5 rounded uppercase tracking-wider"
                                style={{
                                    background: `${statusColors[game.status]}20`,
                                    color: statusColors[game.status],
                                }}
                            >
                                {game.status}
                            </span>
                        </div>

                        <div className="space-y-1 text-xs">
                            <div style={{ color: "var(--text-secondary)" }}>
                                Entry Fee: <span className="font-mono">{game.entryFee} alphaUSD</span>
                            </div>
                            <div style={{ color: "var(--text-secondary)" }}>
                                Players: {playerCount}/{game.maxPlayers}
                                {isFull && (
                                    <span
                                        className="ml-2 px-1 rounded text-[10px]"
                                        style={{ background: "var(--accent-warning)20", color: "var(--accent-warning)" }}
                                    >
                                        FULL
                                    </span>
                                )}
                            </div>
                            {game.status === "waiting" && isHost && (
                                <div style={{ color: canStart ? "var(--accent-success)" : "var(--accent-warning)" }}>
                                    {canStart
                                        ? `Ready to start (min ${game.minPlayers} players)`
                                        : `Need ${game.minPlayers - playerCount} more player(s)`}
                                </div>
                            )}
                            {game.status === "ended" && game.winnerId && (
                                <div style={{ color: "var(--accent-success)" }}>
                                    Winner: {game.winnerMemberId || game.winnerId.slice(0, 8)}...
                                </div>
                            )}
                        </div>
                    </div>

                    {game.totalPot && (
                        <div className="text-right">
                            <div
                                className="text-xs uppercase tracking-wider mb-1"
                                style={{ color: "var(--text-tertiary)" }}
                            >
                                Prize Pool
                            </div>
                            <div
                                className="text-lg font-mono"
                                style={{ color: "var(--accent-primary-solid)" }}
                            >
                                {game.totalPot.toFixed(2)}
                            </div>
                        </div>
                    )}
                </div>
            </GlassCard>
        </motion.div>
    );
}
