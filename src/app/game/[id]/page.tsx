"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import { GlassCard, LiquidGlassButton, WalletContainer } from "@/components";
import { useSend } from "@/hooks/useSend";
import { useTransactionHistory } from "@/hooks/useTransactionHistory";
import { getGameById, updateGame, appendActionLog, generateId } from "@/lib/storage";
import type { Game, GamePlayer } from "@/types/game";
import { motion } from "motion/react";


function useCurrentUserMemberId(): string {
    const { user } = usePrivy();
    return useMemo(() => {
        const accounts = user?.linkedAccounts ?? [];
        if (!Array.isArray(accounts) || accounts.length === 0) return "";
        const email = accounts.find(
            (a: { type?: string }) => a.type === "email"
        ) as { address?: string } | undefined;
        const phone = accounts.find(
            (a: { type?: string }) => a.type === "phone"
        ) as { number?: string } | undefined;
        return email?.address ?? phone?.number ?? "";
    }, [user]);
}

export default function GameRoomPage() {
    const params = useParams();
    const router = useRouter();
    const gameId = params?.id as string;
    const { wallets } = useWallets();
    const { authenticated } = usePrivy();
    const currentUserMemberId = useCurrentUserMemberId();
    const embeddedWallet = wallets.find((w) => w.walletClientType === "privy");
    const walletAddress = embeddedWallet?.address || "";

    const [game, setGame] = useState<Game | null>(null);
    const [isRolling, setIsRolling] = useState(false);
    const { send, isSending, error, txHash } = useSend();

    // Fetch host's transactions to detect join payments
    const {
        transactions: hostTxs,
        refetch: refetchTxs,
    } = useTransactionHistory(game?.hostId || "", undefined);

    const isHost = game?.hostId === walletAddress;
    const isPlayer = game?.players.some((p) => p.walletAddress === walletAddress);

    // Load game from localStorage
    useEffect(() => {
        if (!gameId) return;
        const loadedGame = getGameById(gameId);
        if (loadedGame) {
            setGame(loadedGame);
        }
    }, [gameId]);

    // Poll for new players (if host)
    useEffect(() => {
        if (!game || !isHost || game.status !== "waiting") return;

        const joinMemo = `join:${gameId}`;
        const joinTxs = hostTxs.filter(
            (tx) => tx.type === "receive" && tx.memo?.includes(joinMemo)
        );

        const newPlayers: GamePlayer[] = [];
        for (const tx of joinTxs) {
            const alreadyJoined = game.players.some((p) => p.txHash === tx.hash);
            if (alreadyJoined) continue;

            // Extract player info from tx
            newPlayers.push({
                walletAddress: tx.from || "",
                memberId: tx.memo?.replace(joinMemo, "").trim() || tx.from || "",
                joinedAt: tx.timestamp || Date.now(),
                txHash: tx.hash || "",
            });
        }

        if (newPlayers.length > 0) {
            const updatedPlayers = [...game.players, ...newPlayers];
            const totalPot = updatedPlayers.length * game.entryFee;
            updateGame(gameId, { players: updatedPlayers, totalPot });
            setGame((prev) => prev ? { ...prev, players: updatedPlayers, totalPot } : null);
        }
    }, [hostTxs, game, isHost, gameId]);

    // Refresh transactions periodically
    useEffect(() => {
        if (!isHost || !game || game.status !== "waiting") return;
        const interval = setInterval(() => {
            refetchTxs();
        }, 5000); // Poll every 5 seconds
        return () => clearInterval(interval);
    }, [isHost, game, refetchTxs]);

    const handleJoinGame = async () => {
        if (!game || !walletAddress) return;

        if (game.players.length >= game.maxPlayers) {
            alert("Game is full!");
            return;
        }

        const memo = `join:${gameId}|${currentUserMemberId}`;
        try {
            await send(game.hostId, game.entryFee.toString(), memo);
            appendActionLog({
                id: generateId(),
                type: "send",
                timestamp: Date.now(),
                amount: game.entryFee,
                symbol: "aUSD",
                memo,
                recipientId: game.hostId,
            });
        } catch (err) {
            console.error("Join game failed:", err);
        }
    };

    const handleRollDice = async () => {
        if (!game) return;

        if (game.players.length < game.minPlayers) {
            alert(`Need at least ${game.minPlayers} players to start!`);
            return;
        }

        setIsRolling(true);

        // Simulate rolling animation
        await new Promise((resolve) => setTimeout(resolve, 2000));

        // Pick random winner
        const randomIndex = Math.floor(Math.random() * game.players.length);
        const winner = game.players[randomIndex];
        const totalPot = game.players.length * game.entryFee;

        // Send winnings to winner
        const winMemo = `win:${gameId}`;
        try {
            await send(winner.walletAddress, totalPot.toString(), winMemo);

            updateGame(gameId, {
                status: "ended",
                winnerId: winner.walletAddress,
                winnerMemberId: winner.memberId,
                endedAt: Date.now(),
                totalPot,
            });

            setGame((prev) =>
                prev
                    ? {
                        ...prev,
                        status: "ended",
                        winnerId: winner.walletAddress,
                        winnerMemberId: winner.memberId,
                        endedAt: Date.now(),
                        totalPot,
                    }
                    : null
            );

            appendActionLog({
                id: generateId(),
                type: "send",
                timestamp: Date.now(),
                amount: totalPot,
                symbol: "aUSD",
                memo: winMemo,
                recipientId: winner.walletAddress,
            });
        } catch (err) {
            console.error("Failed to send winnings:", err);
        }

        setIsRolling(false);
    };

    const copyGameLink = () => {
        const link = `${window.location.origin}/game/${gameId}`;
        navigator.clipboard.writeText(link);
        alert("Game link copied!");
    };

    if (!authenticated) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p style={{ color: "var(--text-primary)" }}>Please log in to view this game.</p>
            </div>
        );
    }

    if (!game) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p style={{ color: "var(--text-primary)" }}>Game not found.</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen py-8 px-4">
            <WalletContainer>
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <button
                        onClick={() => router.back()}
                        className="mb-4 text-xs uppercase tracking-wider transition-colors"
                        style={{ color: "var(--text-tertiary)" }}
                    >
                        ← Back
                    </button>

                    <GlassCard>
                        <div className="flex items-start justify-between mb-6">
                            <div>
                                <h2
                                    className="text-xl font-medium mb-2"
                                    style={{ color: "var(--text-primary)" }}
                                >
                                    Pot Luck Game
                                </h2>
                                <span
                                    className="text-xs px-2 py-1 rounded uppercase tracking-wider"
                                    style={{
                                        background: game.status === "waiting" ? "var(--accent-warning)20" :
                                            game.status === "active" ? "var(--accent-success)20" :
                                                "rgba(255,255,255,0.1)",
                                        color: game.status === "waiting" ? "var(--accent-warning)" :
                                            game.status === "active" ? "var(--accent-success)" :
                                                "var(--text-tertiary)",
                                    }}
                                >
                                    {game.status}
                                </span>
                            </div>

                            {game.totalPot !== undefined && (
                                <div className="text-right">
                                    <div
                                        className="text-xs uppercase tracking-wider mb-1"
                                        style={{ color: "var(--text-tertiary)" }}
                                    >
                                        Prize Pool
                                    </div>
                                    <div
                                        className="text-2xl font-mono"
                                        style={{ color: "var(--accent-primary-solid)" }}
                                    >
                                        {game.totalPot.toFixed(2)} alphaUSD
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                            <div>
                                <div
                                    className="text-xs uppercase tracking-wider mb-2"
                                    style={{ color: "var(--text-tertiary)" }}
                                >
                                    Entry Fee
                                </div>
                                <div
                                    className="text-lg font-mono"
                                    style={{ color: "var(--text-secondary)" }}
                                >
                                    {game.entryFee} alphaUSD
                                </div>
                            </div>

                            <div>
                                <div
                                    className="text-xs uppercase tracking-wider mb-2"
                                    style={{ color: "var(--text-tertiary)" }}
                                >
                                    Players
                                </div>
                                <div
                                    className="text-lg"
                                    style={{ color: "var(--text-secondary)" }}
                                >
                                    {game.players.length}/{game.maxPlayers}
                                    {game.players.length < game.minPlayers && (
                                        <span
                                            className="ml-2 text-xs"
                                            style={{ color: "var(--accent-warning)" }}
                                        >
                                            (min {game.minPlayers})
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {isHost && game.status === "waiting" && (
                            <div className="mb-6 p-4 rounded" style={{ background: "rgba(255,255,255,0.05)" }}>
                                <p className="text-xs mb-2" style={{ color: "var(--text-secondary)" }}>
                                    Share this link with friends:
                                </p>
                                <div className="flex gap-2">
                                    <input
                                        readOnly
                                        value={`${typeof window !== "undefined" ? window.location.origin : ""}/game/${gameId}`}
                                        className="flex-1 px-3 py-2 rounded text-xs font-mono"
                                        style={{
                                            background: "var(--glass-background)",
                                            border: "1px solid var(--glass-border)",
                                            color: "var(--text-primary)",
                                        }}
                                    />
                                    <button
                                        onClick={copyGameLink}
                                        className="px-4 py-2 rounded text-xs uppercase tracking-wider transition-all"
                                        style={{
                                            background: "var(--glass-background)",
                                            border: "1px solid var(--glass-border)",
                                            color: "var(--text-primary)",
                                        }}
                                    >
                                        Copy
                                    </button>
                                </div>
                            </div>
                        )}

                        <div className="mb-6">
                            <h3
                                className="text-xs uppercase tracking-wider mb-3"
                                style={{ color: "var(--text-tertiary)" }}
                            >
                                Players
                            </h3>
                            {game.players.length === 0 ? (
                                <p className="text-xs text-center py-4" style={{ color: "var(--text-tertiary)" }}>
                                    No players yet. {isHost ? "Share the link above!" : "Be the first to join!"}
                                </p>
                            ) : (
                                <div className="space-y-2">
                                    {game.players.map((player, idx) => (
                                        <div
                                            key={player.txHash}
                                            className="flex items-center justify-between p-3 rounded"
                                            style={{ background: "rgba(255,255,255,0.05)" }}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div
                                                    className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-mono"
                                                    style={{ background: "var(--accent-primary-solid)20", color: "var(--accent-primary-solid)" }}
                                                >
                                                    {idx + 1}
                                                </div>
                                                <div>
                                                    <div className="text-sm" style={{ color: "var(--text-primary)" }}>
                                                        {player.memberId || `${player.walletAddress.slice(0, 6)}...${player.walletAddress.slice(-4)}`}
                                                    </div>
                                                    {player.walletAddress === walletAddress && (
                                                        <div className="text-xs" style={{ color: "var(--accent-success)" }}>
                                                            (You)
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            {game.status === "ended" && game.winnerId === player.walletAddress && (
                                                <span
                                                    className="text-xs px-2 py-1 rounded uppercase tracking-wider"
                                                    style={{ background: "var(--accent-success)20", color: "var(--accent-success)" }}
                                                >
                                                    Winner 🎉
                                                </span>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {!isHost && !isPlayer && game.status === "waiting" && (
                            <LiquidGlassButton
                                onClick={handleJoinGame}
                                fullWidth={true}
                                disabled={isSending || game.players.length >= game.maxPlayers}
                            >
                                {isSending ? "Joining..." : `Pay ${game.entryFee} alphaUSD to Join`}
                            </LiquidGlassButton>
                        )}

                        {!isHost && isPlayer && game.status === "waiting" && (
                            <div
                                className="text-center py-4 text-sm"
                                style={{ color: "var(--accent-success)" }}
                            >
                                ✓ You&apos;ve joined! Waiting for host to start...
                            </div>
                        )}

                        {isHost && game.status === "waiting" && (
                            <LiquidGlassButton
                                onClick={handleRollDice}
                                fullWidth={true}
                                disabled={isRolling || isSending || game.players.length < game.minPlayers}
                            >
                                {isRolling ? "🎲 Rolling..." : `🎲 Roll Dice & Pick Winner`}
                            </LiquidGlassButton>
                        )}

                        {game.status === "ended" && (
                            <div
                                className="text-center py-6 rounded"
                                style={{ background: "var(--accent-success)10" }}
                            >
                                <div className="text-2xl mb-2">🎉</div>
                                <div className="text-lg mb-2" style={{ color: "var(--accent-success)" }}>
                                    Game Over!
                                </div>
                                <div className="text-sm" style={{ color: "var(--text-secondary)" }}>
                                    Winner: {game.winnerMemberId || `${game.winnerId?.slice(0, 8)}...`}
                                </div>
                                {walletAddress === game.winnerId && (
                                    <div className="text-lg mt-2" style={{ color: "var(--accent-primary-solid)" }}>
                                        You won {game.totalPot} alphaUSD! 💰
                                    </div>
                                )}
                            </div>
                        )}

                        {error && (
                            <div
                                className="mt-4 p-3 rounded text-xs"
                                style={{ background: "var(--accent-error)20", color: "var(--accent-error)" }}
                            >
                                {error}
                            </div>
                        )}

                        {txHash && (
                            <div
                                className="mt-4 p-3 rounded text-xs"
                                style={{ background: "var(--accent-success)20", color: "var(--accent-success)" }}
                            >
                                Transaction successful! Hash: {txHash.slice(0, 10)}...
                            </div>
                        )}
                    </GlassCard>
                </motion.div>
            </WalletContainer>
        </div>
    );
}
