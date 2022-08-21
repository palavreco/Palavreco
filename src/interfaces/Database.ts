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
    win_percentage: number;
    current_streak: number;
    best_streak: number;
}

export interface Guesses {
    id: string;
    one: number;
    two: number;
    three: number;
    four: number;
    five: number;
    six: number;
    losses: number;
    guilds: string[];
}
