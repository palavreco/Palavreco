import fs from 'node:fs';
import dotenv from 'dotenv';
import { knex } from 'knex';
import { Guesses, Rank, Stats, User, Word } from './interfaces/Database';
import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone';
import { log } from './utils/log';
dotenv.config();
dayjs.extend(timezone);

const db = knex({ client: 'pg', connection: process.env.DATABASE_URL });

export function setUp(): void {
	const tables: Record<string, Record<string, 'text' | 'integer' | 'boolean'>> = {
		users: { id: 'text', status: 'boolean' },
		words: { word: 'text', status: 'boolean' },
		stats: {
			id: 'text', games: 'integer', wins: 'integer',
			win_percentage: 'integer', currentStreak: 'integer', bestStreak: 'integer',
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

				if (table === 'guesses') {
					t.specificType('guilds', 'text[]');
				}
			});
		}
	});

	log('Database setup complete', 'DB', 'blue');
}

export async function registerUser(id: string): Promise<void> {
	await db('users').insert({ id, status: false });
}

export async function getUserStatus(id: string): Promise<string> {
	const user = await db<User>('users').where('id', id).first();

	if (!user) return 'not_registered';
	else if (user.status) return 'registered_active';
	else return 'registered_inactive';
}

export async function setPlayed(id: string, win: boolean, guildId: string | null, guesses?: number): Promise<void> {
	await db('users').update({ status: true }).where('id', id);

	const user = {
		stats: await db<Stats>('stats').where('id', id).first(),
		guesses: await db<Guesses>('guesses').where('id', id).first(),
	};

	const number = { 1: 'one', 2: 'two', 3: 'three', 4: 'four', 5: 'five', 6: 'six' }[guesses!]!;
	const winned = win ? 1 : 0;

	if (!user.guesses) {
		if (win) {
			await db('guesses').insert({
				id, one: 0, two: 0, three: 0, four: 0,
				five: 0, six: 0, losses: 0, guilds: guildId ? [guildId] : [],
			});
			await db('guesses').update({ [number]: db.raw('?? + 1', [number]) }).where('id', id);
		} else {
			await db('guesses').insert({
				id, one: 0, two: 0, three: 0, four: 0,
				five: 0, six: 0, losses: 1, guilds: guildId ? [guildId] : [],
			});
		}
	} else {
		if (win) {
			await db('guesses').update({ [number]: db.raw('?? + 1', [number]) }).where('id', id);
		} else {
			await db('guesses').update({ losses: db.raw('?? + 1', ['losses']) }).where('id', id);
		}

		if (guildId && !user.guesses.guilds.includes(guildId)) {
			await db('guesses').update({ guilds: db.raw('array_append(guilds, ?)', [guildId]) }).where('id', id);
		}
	}

	if (!user.stats) {
		await db('stats').insert({
			id, games: 1, wins: winned, win_percentage: win ? 100 : 0,
			currentStreak: winned, bestStreak: winned,
		});
	} else {
		const best = win && user.stats.currentStreak >= user.stats.bestStreak
			? user.stats.currentStreak + 1
			: user.stats.bestStreak;

		await db('stats').update({
			games: db.raw('?? + 1', ['games']),
			wins: db.raw('?? + ??', ['wins', winned]),
			currentStreak: win ? db.raw('?? + 1', ['currentStreak']) : 0,
			bestStreak: best,
		}).where('id', id);

		const updatedUser = await db<Stats>('stats').where('id', id).first();
		const percentage = Math.round((updatedUser!.wins / updatedUser!.games) * 100);
		await db('stats').update({ win_percentage: percentage }).where('id', id);
	}

}

export async function getStats(id: string): Promise<Stats | undefined> {
	return await db<Stats>('stats').where('id', id).first();
}

export async function getGuesses(id: string): Promise<Guesses | undefined> {
	return await db<Guesses>('rank').where('id', id).first();
}

export async function getRank(): Promise<Rank[]> {
	return await db<Rank>('rank').select('*');
}

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

export async function getWord(): Promise<string> {
	return db<Word>('words').where('status', true).first().then(r => r!.word);
}

export function getDay(): Promise<number> {
	return db<Word>('words').select('*').then(r => r.length);
}

export async function verifyWord(): Promise<boolean> {
	const dateFirstGame = dayjs().tz('America/Sao_Paulo').subtract(await getDay(), 'd');
	if (dayjs().tz('America/Sao_Paulo').diff(dateFirstGame, 'd') !== await getDay()) {
		newWord();
		log('New word & users reseted!', 'DB', 'purple');
		return true;
	}
	return false;
}

export async function resetRank(): Promise<void> {
	await db('users').delete();
}
