import fs from 'node:fs';
import dotenv from 'dotenv';
import { Client, QueryResult } from 'pg';
import { UserRow, WordRow } from './interfaces/Database';
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

	await client.query(tableUsers)
		.then(() => log('Users table created/verified', 'DB', 'green'));
	await client.query(tableWords)
		.then(() => log('Words table created/verified', 'DB', 'green'));
}

/**
 * Check if the user exists in the database. If not, add them. And if they do, return a boolean
 * indicating if they can play or not
 * @param id The user's ID
 */
export async function checkOrRegisterUser(id: string): Promise<boolean | void> {
	const userRow: QueryResult<UserRow> = await client.query(`SELECT id, status FROM users WHERE id = '${id}'`);

	if (userRow.rowCount === 0) {
		await client.query(`INSERT INTO users (id, status) VALUES ('${id}', false)`);
	} else if (userRow.rows[0].status === true) {
		return true;
	}
}

/**
 * Used when the user finished the game, making their status true
 * @param id The user's ID
 */
export function played(id: string): void {
	client.query(`UPDATE users SET status = true WHERE id = '${id}'`);
}

/**
 * Resets the user's status to false, meaning they can play again
 * @param id The user's ID
 * @returns Wheter the user is reseted
 */
export async function resetUser(id: string): Promise<boolean> {
	const user: QueryResult<UserRow> = await client.query(`SELECT id, status FROM users WHERE id = '${id}'`);

	if (user.rows[0].status) {
		await client.query(`UPDATE users SET status = false WHERE id = '${id}'`);
		return true;
	} else {
		return false;
	}
}

/**
 * Each day at midnight, this function is called to delete all users and use other word as correct
 */
export async function newDay(): Promise<void> {
	const words: string[] = fs.readFileSync('src/words/wordsList.txt', 'utf8').split('\n');
	const rw: string = words[Math.floor(Math.random() * words.length)].replace('\r', '');

	for (let i = 0; i < words.length; i++) {
		const word: QueryResult<WordRow> = await client.query(`SELECT word, status FROM words WHERE word = '${rw}'`);

		if (word.rowCount === 0) {
			await client.query('UPDATE words SET status = false WHERE status = true');
			await client.query(`INSERT INTO words (word, status) VALUES ('${rw}', true)`);
			await client.query('DELETE FROM users');
		} else {
			continue;
		}
	}
}

/**
 * Creates a new word that will be used in the game
 */
export async function newWord(): Promise<void> {
	const words: string[] = fs.readFileSync('src/words/wordsList.txt', 'utf8').split('\n');
	const rw: string = words[Math.floor(Math.random() * words.length)].replace('\r', '');

	for (let i = 0; i < words.length; i++) {
		const word: QueryResult<WordRow> = await client.query(`SELECT word, status FROM words WHERE word = '${rw}'`);

		if (word.rowCount === 0) {
			await client.query('DELETE FROM words WHERE status = true');
			await client.query(`INSERT INTO words (word, status) VALUES ('${rw}', true)`);
			await client.query('DELETE FROM users');
		} else {
			continue;
		}
	}
}

/**
 * Get the correct word for that day
 * @returns The word
 */
export function getWord(): Promise<string> {
	return client.query('SELECT word, status FROM words WHERE status = true')
		.then((res: QueryResult<WordRow>) => res.rows[0].word);
}

/**
 * Gets the days since the beginning of the bot
 * @returns The number of days
 */
export function getDay(): Promise<number> {
	return client.query('SELECT * FROM words').then((res: QueryResult<WordRow>) => res.rowCount);
}
