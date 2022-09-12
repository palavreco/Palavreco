import fs from 'node:fs';
import readline from 'readline';
import { bisect } from './bisect';

const cache: string[] = [];

export async function isValid(word: string) {
	if (cache.length === 0) {
		const readLine = readline.createInterface({
			input: fs.createReadStream('src/words/validGuess.txt'),
			output: process.stdout,
			terminal: false,
		});

		for await (const line of readLine) {
			cache.push(line);
		}
	}

	const index = bisect(cache, word);
	return cache[index] === word;
}
