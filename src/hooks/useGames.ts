import { useCallback, useEffect, useMemo, useState } from "react";
import { getGames, updateGame, addGame } from "@/lib/storage";
import type { Game } from "@/types/game";

export function useGames(userWalletAddress: string) {
    const [games, setGamesState] = useState<Game[]>([]);

    const refreshGames = useCallback(() => {
        setGamesState(getGames());
    }, []);

    useEffect(() => {
        refreshGames();
    }, [refreshGames]);

    const myGames = useMemo(
        () =>
            games.filter(
                (g) =>
                    g.hostId === userWalletAddress ||
                    g.players.some((p) => p.walletAddress === userWalletAddress)
            ),
        [games, userWalletAddress]
    );

    const createGame = useCallback(
        (game: Game) => {
            addGame(game);
            refreshGames();
        },
        [refreshGames]
    );

    const updateGameState = useCallback(
        (id: string, updates: Partial<Game>) => {
            updateGame(id, updates);
            refreshGames();
        },
        [refreshGames]
    );

    return {
        games: myGames,
        createGame,
        updateGame: updateGameState,
        refreshGames,
    };
}
