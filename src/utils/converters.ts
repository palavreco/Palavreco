import { letter } from './emotes.json';

export function toDefault(content: string) {
	// it is awful, i need suggestions for a better way to do this
	// (arr be the content with each letter as an item)
	content = content.replace(/\n/g, '');
	content = content.replace(/>/g, '> ');
	const arr = content.split(' ');
	arr.splice(-1);

	const table: Record<number, string> = Object.create(null);
	for (let i = 0; i < 6; i++) table[i + 1] = '';

	let convertedLetters = '';
	arr.forEach(emoji => {
		if (Object.values(letter['yellow']).includes(emoji)) {
			convertedLetters += '🟨 ';
		} else if (Object.values(letter['green']).includes(emoji)) {
			convertedLetters += '🟩 ';
		} else if (Object.values(letter['gray']).includes(emoji)) {
			convertedLetters += '⬛ ';
		}
	});

	const tableArr = convertedLetters.split(' ');
	tableArr.splice(-1);

	const lineLength = tableArr.length / 5;
	for (let i = 0; i < lineLength; i++) {
		table[i + 1] = tableArr.splice(0, 5).join('');
	}

	return Object.values(table).join('\n');
}

export function toEmoji(content: string, correct: string) {
	const [contentArr, correctArr] = [content.split(''), correct.split('')];

	const usedLetters = [];
	const emojiWord: Record<number, string> = Object.create(null);
	for (let i = 0; i < 6; i++) emojiWord[i + 1] = '';

	for (let i = 0; i < contentArr.length; i++) {
		const c = contentArr[i];
		usedLetters.push(c);

		if (c === correctArr[i]) {
			emojiWord[i + 1] = letter.green[c as alphabetType];
		} else if (correctArr.includes(c) && c !== correctArr[i]) {
			const caracterCountCorrect = correctArr.filter(car => car === c);
			const caracterCountContent = usedLetters.filter(car => car === c);

			if (caracterCountContent.length > caracterCountCorrect.length) {
				emojiWord[i + 1] = letter.gray[c as alphabetType];
			} else {
				emojiWord[i + 1] = letter.yellow[c as alphabetType];
			}
		} else if (c !== correctArr[i]) {
			emojiWord[i + 1] = letter.gray[c as alphabetType];
		}
	}

	return Object.values(emojiWord).join('');
}

type alphabetType =
	| 'a' | 'b' | 'c' | 'd' | 'e' | 'f' | 'g' | 'h' | 'i' | 'j' | 'k' | 'l' | 'm'
	| 'n' | 'o' | 'p' | 'q' | 'r' | 's' | 't' | 'u' | 'v' | 'w' | 'x' | 'y' | 'z';
