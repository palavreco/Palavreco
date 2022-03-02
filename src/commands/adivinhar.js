const { MessageButton } = require('discord.js');
const { SlashCommandBuilder, ActionRow } = require('@discordjs/builders');
const fs = require('fs');
const readline = require('readline');

const { checkWordDatabase, checkUserDatabase, itPlayed, getDayNumber } = require('../functions/database.js');
const { square, letter } = require('../utils/emotes.json');

const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');
dayjs.extend(utc);
dayjs.extend(timezone);

async function convertToDefaultEmojis(content) {
	content = await content.replaceAll('\n', '');
	content = await content.replace(/>/g, '> ');

	const contentArray = await content.split(' ');
	contentArray.splice(-1);

	const shareMessage = {
		'line1': '',
		'line2': '',
		'line3': '',
		'line4': '',
		'line5': '',
		'line6': '',
	};

	let convertedLetters = '';
	contentArray.forEach(emoji => {
		if (Object.values(letter['yellow']).includes(emoji)) {
			convertedLetters += '🟨 ';
		}
		else if (Object.values(letter['green']).includes(emoji)) {
			convertedLetters += '🟩 ';
		}
		else if (Object.values(letter['gray']).includes(emoji)) {
			convertedLetters += '⬛ ';
		}
	});

	const shareMessageArray = convertedLetters.split(' ');
	shareMessageArray.splice(-1);

	const lineLength = shareMessageArray.length / 5;
	for (let i = 0; i < lineLength; i++) {
		shareMessage[`line${i + 1}`] = shareMessageArray.splice(0, 5).join('');
	}

	return Object.values(shareMessage).map(line => line).join('\n');
}

async function iosOrAndroidPc(interaction) {
	const filter = (button) => button.user.id === interaction.user.id;

	let plataform = '';
	await interaction.channel.awaitMessageComponent({ filter })
		.then(int => {
			if (int.customId === 'pc-ios') plataform = 'pc-ios';
			else plataform = 'android';
		});

	return plataform;
}

let usersTries = {};
let activeGames = {};

setInterval(() => {
	const brazilianTime = dayjs().tz('America/Sao_Paulo').format('HH:mm');
	if (brazilianTime === '00:00') {
		usersTries = {};
		activeGames = {};
	}
}, 60_000);

async function sendGameMessageAndResults(interaction) {
	const channel = interaction.client.channels.cache.get(interaction.channel.id);
	if (!channel.permissionsFor(interaction.client.user).has('MANAGE_MESSAGES')) {
		await interaction.reply('Ops! Parece que eu não tenho permissão para executar esse comando.\nPor favor, me dê um cargo que tenha permissão de `Gerenciar mensagens`.');
		return;
	}

	const playingUser = { id: interaction.user.id, attempts: [] };
	const correctWord = await checkWordDatabase();

	const gameMessage = {
		'line1': `${square['gray'].repeat(5)}`,
		'line2': `${square['gray'].repeat(5)}`,
		'line3': `${square['gray'].repeat(5)}`,
		'line4': `${square['gray'].repeat(5)}`,
		'line5': `${square['gray'].repeat(5)}`,
		'line6': `${square['gray'].repeat(5)}`,
	};

	function returnGameTable() {
		const userTries = usersTries[interaction.user.id];

		if (!userTries) {
			return Object.values(gameMessage).map(line => line).join('\n');
		}
		else {
			for (let i = 0; i < 6; i++) {
				if (!userTries.attempts[i]) {
					gameMessage[`line${i + 1}`] = `${square['gray'].repeat(5)}`;
				}
				else {
					gameMessage[`line${i + 1}`] = userTries.attempts[i];
				}
			}
			return Object.values(gameMessage).map(line => line).join('\n');
		}
	}

	let i = 0;
	if (activeGames[interaction.user.id]) {
		await interaction.reply('Você já está jogando!\nSe a mensagem não aparece mais, mande `cancelar` no canal e tente novamente.');
		return;
	}
	else {
		activeGames[interaction.user.id] = { id: interaction.user.id };

		await interaction.reply({
			content: `Adivinhe o **PALAVRECO** de hoje! 👀\n\n${returnGameTable()}\n\nPara cancelar o jogo, digite \`cancelar\``,
			ephemeral: true,
		});

		const userTries = usersTries[interaction.user.id];
		if (userTries) {
			const triesLeft = userTries.attempts.length;
			i = triesLeft;
		}
		else {
			usersTries[interaction.user.id] = playingUser;
		}
	}

	for (i; i < 6; i++) {
		const collectedMessage = await awaitMessage(interaction);
		setTimeout(async () => {
			await collectedMessage.message.delete();
		}, 300);

		const word = collectedMessage.content.normalize('NFKD').replace(/\p{Diacritic}/gu, '');

		if (word === 'cancelar') {
			await interaction.editReply('Você encerrou o jogo :(');
			delete activeGames[interaction.user.id];
			i = 7;
		}
		else if (word.length != 5) {
			await interaction.editReply(`Adivinhe o **PALAVRECO** de hoje! 👀\n\n${returnGameTable()}\n**Atenção:** A palavra deve ter 5 letras!`);
			i--;
		}
		else if (await checkWordIsValid(word) === false) {
			await interaction.editReply(`Adivinhe o **PALAVRECO** de hoje! 👀\n\n${returnGameTable()}\n**Atenção:** A palavra não é válida!`);
			i--;
		}
		else {
			const row = new ActionRow()
				.addComponents(
					new MessageButton()
						.setCustomId('pc-ios')
						.setLabel('PC ou iOS')
						.setStyle('SUCCESS'),
					new MessageButton()
						.setCustomId('android')
						.setLabel('Android')
						.setStyle('SUCCESS'),
				);

			usersTries[interaction.user.id].attempts.push(await convertContentToEmojis(word, correctWord));

			if (word === correctWord) {
				await interaction.editReply(`Parabéns, você acertou em ${i + 1} tentativas! :tada:\n\n${returnGameTable()}`);
				await itPlayed(interaction.user.id);

				delete usersTries[interaction.user.id];

				await interaction.channel.send(`<@${interaction.user.id}> Precione o botão correspondente à plataforma em que está jogando para que seja possível copiar a mensagem e compartilhá-la!`);
				const msg = await interaction.channel.send({
					content: 'ㅤ',
					components: [row],
				});

				if (await iosOrAndroidPc(interaction) === 'pc-ios') {
					await msg.edit({
						content: `Joguei palavreco.com #${await getDayNumber()} ${i + 1}/6\n\n${await convertToDefaultEmojis(returnGameTable())}`,
						components: [],
					});
				}
				else {
					await msg.edit({
						content: `\`\`\`\nJoguei palavreco.com #${await getDayNumber()} ${i + 1}/6\n\n${await convertToDefaultEmojis(returnGameTable())}\n\`\`\``,
						components: [],
					});
				}

				i = 7;
			}
			else {
				await interaction.editReply(`Adivinhe o **PALAVRECO** de hoje! 👀\n\n${returnGameTable()}`);
				if (i === 5) {
					await interaction.editReply(`${returnGameTable()}\n\nVocê perdeu, a palavra era **${correctWord}**. :frowning:\nQuem sabe na próxima você consegue!`);
					await itPlayed(interaction.user.id);

					delete activeGames[interaction.user.id];

					await interaction.channel.send(`<@${interaction.user.id}> Pressione o botão correspondente à plataforma em que está jogando para que seja possível copiar a mensagem e compartilhá-la!`);
					const msg = await interaction.channel.send({
						content: 'ㅤ',
						components: [row],
					});

					if (await iosOrAndroidPc(interaction) === 'pc-ios') {
						await msg.edit({
							content: `Joguei palavreco.com #${await getDayNumber()} X/6\n\n${await convertToDefaultEmojis(returnGameTable())}`,
							components: [],
						});
					}
					else {
						await msg.edit({
							content: `\`\`\`\nJoguei palavreco.com #${await getDayNumber()} X/6\n\n${await convertToDefaultEmojis(returnGameTable())}\n\`\`\``,
							components: [],
						});
					}

					return;
				}
				continue;
			}
		}
	}
}

function awaitMessage(interaction) {
	const filter = (msg) => interaction.user.id === msg.author.id;
	const sendedMessage = interaction.channel.awaitMessages({ max: 1, filter }).then(async (msg) => {
		const response = { content: '', message: msg.first() };
		const content = await msg.first().content;
		if (content) {
			response.content = content.trim().toLowerCase();
		}

		return response;
	});

	return sendedMessage;
}

async function convertContentToEmojis(content, correctWord) {
	const contentArray = content.split('');
	const correctWordArray = correctWord.split('');

	const usedLetters = [];

	const wordInEmojis = {
		'1': '',
		'2': '',
		'3': '',
		'4': '',
		'5': '',
	};

	for (let i = 0; i < contentArray.length; i++) {
		if (contentArray[i] === correctWordArray[i]) {
			usedLetters.push(contentArray[i]);
			wordInEmojis[`${i + 1}`] = letter['green'][correctWordArray[i]];
		}
	}

	for (let i = 0; i < contentArray.length; i++) {
		if (correctWordArray.includes(contentArray[i]) && contentArray[i] !== correctWordArray[i]) {
			usedLetters.push(contentArray[i]);

			const caracterCountCorrect = correctWordArray.filter(car => car === contentArray[i]);
			const caracterCountContent = usedLetters.filter(car => car === contentArray[i]);

			if (caracterCountContent.length > caracterCountCorrect.length) { wordInEmojis[`${i + 1}`] = letter['gray'][contentArray[i]]; }
			else { wordInEmojis[`${i + 1}`] = letter['yellow'][contentArray[i]]; }
		}
		else if (contentArray[i] !== correctWordArray[i]) {
			usedLetters.push(contentArray[i]);

			wordInEmojis[`${i + 1}`] = letter['gray'][contentArray[i]];
		}
	}

	return Object.values(wordInEmojis).map(emoji => emoji).join('');
}

async function checkWordIsValid(word) {
	const readLine = readline.createInterface({
		input: fs.createReadStream('src/utils/validGuess.txt'),
		output: process.stdout,
		terminal: false,
	});

	let isValid = false;
	for await (const line of readLine) {
		if (line === word) {
			isValid = true;
			break;
		}
	}
	return isValid;
}

module.exports = {
	data: new SlashCommandBuilder()
		.setName('adivinhar')
		.setDescription('Tente adivinhar a palavra do dia'),
	async execute(interaction) {
		if (await checkUserDatabase(interaction.user.id) === 'alreadyPlayed') {
			const timestamp = dayjs().tz('America/Sao_Paulo').endOf('day').unix();
			await interaction.reply({
				content: `Você já jogou hoje!\nTempo restante até a próxima palavra: <t:${timestamp}:R>`,
				ephemeral: true,
			});
			return;
		}

		await sendGameMessageAndResults(interaction);
	},
};
