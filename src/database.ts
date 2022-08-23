import fs from 'node:fs';
import dotenv from 'dotenv';
import { knex } from 'knex';
import { User, Word } from './interfaces/Database';
import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone';
import { log } from './utils/log';
dotenv.config();
dayjs.extend(timezone);

const db = knex({ client: 'pg', connection: process.env.DATABASE_URL });

export async function setUp(): Promise<void> {
	if (!await db.schema.hasTable('users')) {
		await db.schema.createTable('users', t => {
			t.text('id'); t.boolean('status');
			['gamesWins', 'streak', 'guesses', 'rank'].forEach(key => {
				t.specificType(key, 'integer[]');
			});
			t.specificType('guilds', 'text[]');
		});
	}

	if (!await db.schema.hasTable('words')) {
		await db.schema.createTable('words', t => {
			t.text('word'); t.boolean('status');
		});
	}

	log('Database setup complete', 'DB', 'blue');
}

export async function registerUser(id: string): Promise<User> {
	await db('users').insert({ id, status: false });
	return await db<User>('users').where({ id }).first() as User;
}

export async function getUserStatus(id: string): Promise<string> {
	const user = await db<User>('users').where('id', id).first();

	if (!user) return 'not_registered';
	else if (user.status) return 'registered_active';
	else return 'registered_inactive';
}

export async function setPlayed(id: string, guesses: number): Promise<void> {
	const user = await db<User>('users').where('id', id).first() as User;
	const { gamesWins, streak, guesses: userGuesses } = user;
	const won = guesses <= 6 ? true : false;

	if (gamesWins) {
		const distribution = userGuesses.map((guess, index) => {
			if (index === guesses - 1) return guess + 1;
			else return guess;
		});

		await db('users').update({
			status: true,
			gamesWins: [gamesWins[0] + 1, gamesWins[1] + (won ? 1 : 0)],
			streak: [won ? streak[0] + 1 : 0, won && streak[0] >= streak[1] ? streak[0] + 1 : streak[1]],
			guesses: distribution,
			rank: distribution,
		}).where('id', id);
	} else {
		const distribution = Array(7).fill(0);
		distribution[guesses - 1] = 1;

		await db('users').update({
			status: true,
			gamesWins: [1, won ? 1 : 0],
			streak: [won ? 1 : 0, won ? 1 : 0],
			guesses: distribution,
			rank: distribution,
		}).where('id', id);
	}
}

export async function setNewGuild(userId: string, guildId: string): Promise<void> {
	const user = await db<User>('users').where('id', userId).first() ?? await registerUser(userId);

	if (!user.guilds) {
		await db('users').update({ guilds: [guildId] }).where('id', userId);
	}

	const updatedUser = await db<User>('users').where('id', userId).first();
	if (updatedUser!.guilds.includes(guildId)) return;

	await db('users').update({ guilds: db.raw('array_append(guilds, ?)', [guildId]) }).where('id', userId);
}

export async function getUser(id: string): Promise<User | undefined> {
	return await db<User>('users').where('id', id).first();
}

export async function getAllUsers(): Promise<User[]> {
	return await db<User>('users').select('*');
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
	await db('users').update({ rank: null });
}
