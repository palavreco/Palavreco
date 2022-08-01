/* eslint-disable max-len */
import fs from 'node:fs';
import dotenv from 'dotenv';
import { Client, QueryResult } from 'pg';
import { GuessesRow, StatsRow, UserRow, WordRow } from './interfaces/Database';
import { log } from './utils/log';
dotenv.config();

const client = new Client({
	connectionString: process.env.DATABASE_URL,
	ssl: { rejectUnauthorized: false },
});

/**
 * Connect to the database and create the tables if they don't exist
 */
export async function setUp(): Promise<void> {
	client.connect();

	const tableUsers = 'CREATE TABLE IF NOT EXISTS "users" ("id" TEXT, "status" BOOLEAN);';
	const tableWords = 'CREATE TABLE IF NOT EXISTS "words" ("word" TEXT, "status" BOOLEAN);';
	const tableStats = 'CREATE TABLE IF NOT EXISTS "stats" ("id" TEXT, "games" INTEGER, "wins" INTEGER, "win_percentage" INTEGER, "current_streak" INTEGER, "best_streak" INTEGER);';
	const tableGuesses = 'CREATE TABLE IF NOT EXISTS "guesses" ("id" TEXT, "one" INTEGER, "two" INTEGER, "three" INTEGER, "four" INTEGER, "five" INTEGER, "six" INTEGER, "losses" INTEGER);';

	await client.query(tableUsers)
		.then(() => log('Users table created/verified', 'DB', 'green'));
	await client.query(tableWords)
		.then(() => log('Words table created/verified', 'DB', 'green'));
	await client.query(tableStats)
		.then(() => log('Stats table created/verified', 'DB', 'green'));
	await client.query(tableGuesses)
		.then(() => log('Guesses table created/verified', 'DB', 'green'));
}

/**
 * Indicates whether this user is registered in the database
 * @param id The user id to check
 * @returns {Promise<string>} The user status
 */
export async function getUserStatus(id: string): Promise<string> {
	const userRow: QueryResult<UserRow> = await client.query(`SELECT id, status FROM users WHERE id = '${id}'`);

	if (!userRow.rowCount) {
		return 'not_registered';
	} else if (userRow.rows[0].status) {
		return 'registered_active';
	} else {
		return 'registered_inactive';
	}
}

/**
 * Registers a user in the database
 * @param id The id of the user to register
 */
export function registerUser(id: string): void {
	client.query(`INSERT INTO users (id, status) VALUES ('${id}', false)`);
}

/**
 * Sets the status of a user to false in the database
 * @param id The user id to set as played
 */
export async function setPlayed(id: string, win: boolean, guesses?: number): Promise<void> {
	client.query(`UPDATE users SET status = true WHERE id = '${id}'`);

	const userStats: QueryResult<StatsRow> = await client.query(`SELECT * FROM stats WHERE id = '${id}'`);
	const userGuesses: QueryResult<GuessesRow> = await client.query(`SELECT * FROM guesses WHERE id = '${id}'`);

	// @ts-ignore
	const number = { 1: 'one', 2: 'two', 3: 'three', 4: 'four', 5: 'five', 6: 'six' }[guesses];
	const winned = win ? 1 : 0;

	if (!userGuesses.rowCount) {
		if (win) {
			await client.query(`INSERT INTO guesses (id, one, two, three, four, five, six, losses) VALUES ('${id}', 0, 0, 0, 0, 0, 0, 0)`);
			await client.query(`UPDATE guesses SET ${number} = ${number} + 1 WHERE id = '${id}'`);
		} else {
			await client.query(`INSERT INTO guesses (id, one, two, three, four, five, six, losses) VALUES ('${id}', 0, 0, 0, 0, 0, 0, 1)`);
		}
	} else {
		if (win) {
			await client.query(`UPDATE guesses SET ${number} = ${number} + 1 WHERE id = '${id}'`);
		} else {
			await client.query(`UPDATE guesses SET losses = losses + 1 WHERE id = '${id}'`);
		}
	}

	if (!userStats.rowCount) {
		await client.query(`INSERT INTO stats (id, games, wins, win_percentage, current_streak, best_streak) VALUES ('${id}', 1, ${winned}, ${win ? 100 : 0}, ${winned}, ${winned})`);

	} else {
		const current_streak = win ? userStats.rows[0].current_streak + 1 : 0;
		const best_streak = win ? Math.max(userStats.rows[0].best_streak, current_streak) : userStats.rows[0].best_streak;
		await client.query(`UPDATE stats SET games = games + 1, wins = wins + ${winned}, current_streak = ${current_streak}, best_streak = ${best_streak} WHERE id = '${id}'`);

		const updatedUser: QueryResult<StatsRow> = await client.query(`SELECT * FROM stats WHERE id = '${id}'`);
		const percentage = (updatedUser.rows[0].wins / updatedUser.rows[0].games) * 100;
		await client.query(`UPDATE stats SET win_percentage = ${percentage} WHERE id = '${id}'`);
	}

}

/**
 * Gets the stats of a user from the database
 * @param id The user's ID
 * @returns {Promise<StatsRow>} The user's stats object
 */
export async function getStats(id: string): Promise<StatsRow | null> {
	const stats: QueryResult<StatsRow> = await client.query(`SELECT * FROM stats WHERE id = '${id}'`);
	return stats ? stats.rows[0] : null;
}

/**
 * Gets the guesses of a user from the database
 * @param id The user's ID
 * @returns {Promise<GuessesRow>} The user's guesses object
 */
export async function getGuesses(id: string): Promise<GuessesRow | null> {
	const guesses: QueryResult<GuessesRow> = await client.query(`SELECT * FROM guesses WHERE id = '${id}'`);
	return guesses ? guesses.rows[0] : null;
}

/**
 * Resets the user's status to false, meaning they can play again
 * @param id The user's ID
 * @returns {Promise<string>} The user state after resetting
 */
export async function resetUser(id: string): Promise<string> {
	const user: QueryResult<UserRow> = await client.query(`SELECT id, status FROM users WHERE id = '${id}'`);

	if (!user.rowCount) {
		return 'dont_exist';
	} else if (user.rows[0].status) {
		await client.query(`UPDATE users SET status = false WHERE id = '${id}'`);
		return 'reseted';
	} else {
		return 'already_reseted';
	}
}

/**
 * Deletes/replaces the word in the database to a new one be used and resets all the users
 * @param replace Whether to replace the word
 */
export async function newWord(replace = false): Promise<void> {
	const words: string[] = fs.readFileSync('src/words/wordsList.txt', 'utf8').split('\n');
	const rw: string = words[Math.floor(Math.random() * words.length)].replace('\r', '');

	for (let i = 0; i < words.length; i++) {
		const word: QueryResult<WordRow> = await client.query(`SELECT word, status FROM words WHERE word = '${rw}'`);

		if (word.rowCount === 0) {
			if (replace) {
				await client.query('DELETE FROM words WHERE status = true');
			} else {
				await client.query('UPDATE words SET status = false WHERE status = true');
			}

			await client.query(`INSERT INTO words (word, status) VALUES ('${rw}', true)`);
			await client.query('DELETE FROM users');
		} else {
			continue;
		}
	}
}

/**
 * Get the correct word for that day
 * @returns {Promise<string>} The word
 */
export function getWord(): Promise<string> {
	return client.query('SELECT word, status FROM words WHERE status = true')
		.then((res: QueryResult<WordRow>) => res.rows[0].word);
}

/**
 * Gets the days since the beginning of the bot
 * @returns {Promise<number>} The number of days
 */
export function getDay(): Promise<number> {
	return client.query('SELECT * FROM words').then((res: QueryResult<WordRow>) => res.rowCount);
}
