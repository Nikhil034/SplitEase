export type GameStatus = "waiting" | "active" | "ended";

export interface Game {
    id: string;
    hostId: string; // Host's wallet address
    hostMemberId: string; // Host's email or phone
    entryFee: number; // Amount in alphaUSD
    maxPlayers: number;
    minPlayers: number;
    createdAt: number;
    status: GameStatus;
    players: GamePlayer[];
    winnerId?: string; // Winner's wallet address
    winnerMemberId?: string; // Winner's email or phone
    endedAt?: number;
    totalPot?: number;
}

export interface GamePlayer {
    walletAddress: string;
    memberId: string; // Email or phone
    joinedAt: number;
    txHash: string; // Join transaction hash
}

export interface GameHistoryEntry {
    gameId: string;
    role: "host" | "player";
    entryFee: number;
    result?: "won" | "lost";
    prize?: number;
    endedAt?: number;
}
