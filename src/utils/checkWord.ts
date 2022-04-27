import fs from 'node:fs';
import readline from 'readline';

export async function isValid(word: string) {
	const readLine = readline.createInterface({
		input: fs.createReadStream('src/words/validGuess.txt'),
		output: process.stdout,
		terminal: false,
	});

	let valid = false;
	for await (const line of readLine) {
		if (line === word) {
			valid = true;
		}
	}

	return valid;
}
