import fs from 'node:fs';
import dotenv from 'dotenv';
import { knex } from 'knex';
import { Guesses, Stats, User, Word } from './interfaces/Database';
import { log } from './utils/log';
dotenv.config();

const db = knex({ client: 'pg', connection: process.env.DATABASE_URL });

/**
 * Connect to the database and create the tables if they don't exist
 */
export function setUp(): void {
	const tables: Record<string, Record<string, 'text' | 'integer' | 'boolean'>> = {
		users: { id: 'text', status: 'boolean' },
		words: { word: 'text', status: 'boolean' },
		stats: {
			id: 'text', games: 'integer', wins: 'integer',
			win_percentage: 'integer', current_streak: 'integer', best_streak: 'integer',
		},
		guesses: {
			id: 'text', one: 'integer', two: 'integer', three: 'integer',
			four: 'integer', five: 'integer', six: 'integer', losses: 'integer',
		},
	};

	Object.keys(tables).forEach(async table => {
		if (!await db.schema.hasTable(table)) {
			await db.schema.createTable(table, t => {
				Object.entries(tables[table]).forEach(([key, type]) => t[type](key));
			});
		}
	});

	log('Database setup complete', 'DB', 'blue');
}

/**
 * Registers a user in the database
 * @param id The id of the user to register
 */
export async function registerUser(id: string): Promise<void> {
	await db('users').insert({ id, status: false });
}

/**
 * Indicates whether this user is registered in the database
 * @param id The user id to check
 * @returns {Promise<string>} The user status
 */
export async function getUserStatus(id: string): Promise<string> {
	const user = await db<User>('users').where('id', id).first();

	if (!user) return 'not_registered';
	else if (user.status) return 'registered_active';
	else return 'registered_inactive';
}

/**
 * Sets the status of a user to false in the database
 * @param id The user id to set as played
 */
export async function setPlayed(id: string, win: boolean, guesses?: number): Promise<void> {
	await db('users').update({ status: true }).where('id', id);

	const user = {
		stats: await db<Stats>('stats').where('id', id).first(),
		guesses: await db<Guesses>('guesses').where('id', id).first(),
	};

	const number = { 1: 'one', 2: 'two', 3: 'three', 4: 'four', 5: 'five', 6: 'six' }[guesses!]!;
	const winned = win ? 1 : 0;

	if (!user.guesses) {
		if (win) {
			await db('guesses').insert({ id, one: 0, two: 0, three: 0, four: 0, five: 0, six: 0, losses: 0 });
			await db('guesses').update({ [number]: db.raw('?? + 1', [number]) }).where('id', id);
		} else {
			await db('guesses').insert({ id, one: 0, two: 0, three: 0, four: 0, five: 0, six: 0, losses: 1 });
		}
	} else {
		if (win) {
			await db('guesses').update({ [number]: db.raw('?? + 1', [number]) }).where('id', id);
		} else {
			await db('guesses').update({ losses: db.raw('?? + 1', ['losses']) }).where('id', id);
		}
	}

	if (!user.stats) {
		await db('stats').insert({
			id, games: 1, wins: winned, win_percentage: win ? 100 : 0,
			current_streak: winned, best_streak: winned,
		});
	} else {
		const best = win && user.stats.current_streak >= user.stats.best_streak
			? user.stats.current_streak + 1
			: user.stats.best_streak;

		await db('stats').update({
			games: db.raw('?? + 1', ['games']),
			wins: db.raw('?? + ??', ['wins', winned]),
			current_streak: win ? db.raw('?? + 1', ['current_streak']) : 0,
			best_streak: best,
		}).where('id', id);

		const updatedUser = await db<Stats>('stats').where('id', id).first();
		const percentage = Math.round((updatedUser!.wins / updatedUser!.games) * 100);
		await db('stats').update({ win_percentage: percentage }).where('id', id);
	}

}

/**
 * Gets the stats of a user from the database
 * @param id The user's ID
 * @returns {Promise<Stats>} The user's stats object
 */
export async function getStats(id: string): Promise<Stats | undefined> {
	return await db<Stats>('stats').where('id', id).first();
}

/**
 * Gets the guesses of a user from the database
 * @param id The user's ID
 * @returns {Promise<Guesses>} The user's guesses object
 */
export async function getGuesses(id: string): Promise<Guesses | undefined> {
	return await db<Guesses>('guesses').where('id', id).first();
}

/**
 * Gets all the users and their guesses distributions from the database
 * @returns {Promise<Guesses[]>} The list of all registered users
 */
export async function getAllGuesses(): Promise<Guesses[]> {
	return await db<Guesses>('guesses').select('*');
}

/**
 * Resets the user's status to false, meaning they can play again
 * @param id The user's ID
 * @returns {Promise<string>} The user state after resetting
 */
export async function resetUser(id: string): Promise<string> {
	const user = await db<User>('users').where('id', id).first();

	if (!user) {
		return 'dont_exist';
	} else if (user.status) {
		await db('users').update({ status: false }).where('id', id);
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
		const word = await db<Word>('words').where('word', rw).first();

		if (!word) {
			if (replace) await db('words').delete().where('status', true);
			else await db('words').update({ status: false }).where('status', true);

			await db('words').insert({ word: rw, status: true });
			await db('users').update({ status: false });
		} else {
			continue;
		}
	}
}

/**
 * Get the correct word for that day
 * @returns {Promise<string>} The word
 */
export async function getWord(): Promise<string> {
	return db<Word>('words').where('status', true).first().then(r => r!.word);
}

/**
 * Gets the days since the beginning of the bot
 * @returns {Promise<number>} The number of days
 */
export function getDay(): Promise<number> {
	return db<Word>('words').select('*').then(r => r.length);
}
