import { letter } from '../assets/emotes.json';

export function toDefault(content: string) {
	const arr = content
		.replace(/\n/g, '')
		.replace(/>/g, '> ')
		.split(' ')
		.slice(0, -1);

	const table: Record<number, string> = {};
	for (let i = 0; i < 6; i++) table[i + 1] = '';

	let convertedLetters = '';
	arr.forEach((emoji) => {
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
	const emojiWord: Record<number, string> = {};
	for (let i = 0; i < 6; i++) emojiWord[i + 1] = '';

	for (let i = 0; i < contentArr.length; i++) {
		if (contentArr[i] === correctArr[i]) {
			usedLetters.push(contentArr[i]);
			emojiWord[i + 1] = letter.green[correctArr[i] as alphabet];
		}
	}

	for (let i = 0; i < contentArr.length; i++) {
		if (correctArr.includes(contentArr[i]) && contentArr[i] !== correctArr[i]) {
			usedLetters.push(contentArr[i]);
			const charCountCorrect = correctArr.filter(
				(car) => car === contentArr[i],
			).length;
			const charCountContent = usedLetters.filter(
				(car) => car === contentArr[i],
			).length;

			if (charCountContent > charCountCorrect) {
				emojiWord[i + 1] = letter.gray[contentArr[i] as alphabet];
			} else {
				emojiWord[i + 1] = letter.yellow[contentArr[i] as alphabet];
			}
		} else if (contentArr[i] !== correctArr[i]) {
			usedLetters.push(contentArr[i]);
			emojiWord[i + 1] = letter.gray[contentArr[i] as alphabet];
		}
	}

	return Object.values(emojiWord).join('');
}

type alphabet =
	| 'a'
	| 'b'
	| 'c'
	| 'd'
	| 'e'
	| 'f'
	| 'g'
	| 'h'
	| 'i'
	| 'j'
	| 'k'
	| 'l'
	| 'm'
	| 'n'
	| 'o'
	| 'p'
	| 'q'
	| 'r'
	| 's'
	| 't'
	| 'u'
	| 'v'
	| 'w'
	| 'x'
	| 'y'
	| 'z';
