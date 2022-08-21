export interface Word {
    word: string;
    status: boolean;
}

export interface User {
    id: string;
    status: boolean;
}

export interface Stats {
    id: string;
    games: number;
    wins: number;
    currentStreak: number;
    bestStreak: number;
    guesses: number[];
}

export interface Rank {
    id: string;
    guesses: number[];
    guilds: string[];
}
