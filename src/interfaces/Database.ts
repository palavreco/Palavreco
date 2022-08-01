export interface WordRow {
    word: string;
    status: boolean;
}

export interface UserRow {
    id: string;
    status: boolean;
}

export interface StatsRow {
    id: string;
    games: number;
    wins: number;
    win_percentage: number;
    current_streak: number;
    best_streak: number;
}

export interface GuessesRow {
    id: string;
    one: number;
    two: number;
    three: number;
    four: number;
    five: number;
    six: number;
    losses: number;
}
