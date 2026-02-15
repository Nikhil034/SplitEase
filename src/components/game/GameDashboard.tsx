"use client";

import { useState } from "react";
import { GlassCard, LiquidGlassButton, Input } from "@/components";
import { CreateGameModal } from "./CreateGameModal";
import { GameCard } from "./GameCard";
import type { Game } from "@/types/game";
import { motion } from "motion/react";
import { useRouter } from "next/navigation";

interface GameDashboardProps {
    games: Game[];
    onCreateGame: (game: Game) => void;
    userWalletAddress: string;
    userMemberId: string;
}

export function GameDashboard({
    games,
    onCreateGame,
    userWalletAddress,
    userMemberId,
}: GameDashboardProps) {
    const router = useRouter();
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [joinGameId, setJoinGameId] = useState("");

    const handleJoinByLink = () => {
        if (!joinGameId.trim()) {
            alert("Please enter a game ID");
            return;
        }
        router.push(`/game/${joinGameId.trim()}`);
    };

    const activeGames = games.filter((g) => g.status === "waiting" || g.status === "active");
    const endedGames = games.filter((g) => g.status === "ended");

    return (
        <>
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <GlassCard>
                    <h3
                        className="text-xs tracking-widest uppercase mb-6"
                        style={{ color: "var(--text-tertiary)" }}
                    >
                        Pot Luck Games
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <LiquidGlassButton
                            onClick={() => setShowCreateModal(true)}
                            fullWidth={true}
                        >
                            Create New Game
                        </LiquidGlassButton>

                        <div className="flex gap-2">
                            <Input
                                type="text"
                                value={joinGameId}
                                onChange={setJoinGameId}
                                placeholder="Game ID to join"
                            />
                            <button
                                onClick={handleJoinByLink}
                                className="px-4 py-2 rounded text-xs uppercase tracking-wider transition-all"
                                style={{
                                    background: "var(--glass-background)",
                                    border: "1px solid var(--glass-border)",
                                    color: "var(--text-primary)",
                                }}
                            >
                                Join
                            </button>
                        </div>
                    </div>

                    {activeGames.length > 0 && (
                        <div className="mb-6">
                            <h4
                                className="text-xs tracking-wider uppercase mb-3"
                                style={{ color: "var(--text-secondary)" }}
                            >
                                Active Games
                            </h4>
                            <div className="space-y-3">
                                {activeGames.map((game) => (
                                    <GameCard
                                        key={game.id}
                                        game={game}
                                        onClick={() => router.push(`/game/${game.id}`)}
                                        isHost={game.hostId === userWalletAddress}
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    {endedGames.length > 0 && (
                        <div>
                            <h4
                                className="text-xs tracking-wider uppercase mb-3"
                                style={{ color: "var(--text-secondary)" }}
                            >
                                Game History
                            </h4>
                            <div className="space-y-3">
                                {endedGames.map((game) => (
                                    <GameCard
                                        key={game.id}
                                        game={game}
                                        onClick={() => router.push(`/game/${game.id}`)}
                                        isHost={game.hostId === userWalletAddress}
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    {games.length === 0 && (
                        <p
                            className="text-xs text-center py-8"
                            style={{ color: "var(--text-tertiary)" }}
                        >
                            No games yet. Create one to get started!
                        </p>
                    )}
                </GlassCard>
            </motion.div>

            <CreateGameModal
                isOpen={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                onCreateGame={onCreateGame}
                hostWalletAddress={userWalletAddress}
                hostMemberId={userMemberId}
            />
        </>
    );
}
