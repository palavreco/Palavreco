const { SlashCommandBuilder } = require('@discordjs/builders');
const fs = require('fs');
const readline = require('readline');
const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');
const { checkWordDatabase, checkUserDatabase, itPlayed } = require('../utils/database.js');
const { square, letter } = require('../utils/emotes.json');

dayjs.extend(utc);
dayjs.extend(timezone);

async function sendGameMessageAndResults(interaction) {
	// A mensagem principal do jogo
	const gameMessage = {
		'line1': `${square['gray'].repeat(5)}`,
		'line2': `${square['gray'].repeat(5)}`,
		'line3': `${square['gray'].repeat(5)}`,
		'line4': `${square['gray'].repeat(5)}`,
		'line5': `${square['gray'].repeat(5)}`,
		'line6': `${square['gray'].repeat(5)}`,
	};
	// A tabela do jogo, gerada dinamicamente
	function returnGameTable() {
		return Object.values(gameMessage).map(line => line).join('\n');
	}

	await interaction.reply(`Adivinhe o **PALAVRECO** de hoje! :eyes:\n\n${returnGameTable()}`);

	const correctWord = await checkWordDatabase();

	for (let i = 0; i < 6; i++) {
		const collectedMessage = await awaitMessage(interaction);

		// Verifica se a mensagem pode ser realmente considerada como uma tentativa
		if (collectedMessage.content.length != 5) {
			await interaction.editReply(`Adivinhe o **PALAVRECO** de hoje! :eyes:\n\n${returnGameTable()}\n**Atenção:** A palavra deve ter 5 letras!`);
			await collectedMessage.message.delete();
			i--;
		}
		else if (await checkWordIsValid(collectedMessage.content) === false) {
			await interaction.editReply(`Adivinhe o **PALAVRECO** de hoje! :eyes:\n\n${returnGameTable()}\n**Atenção:** A palavra não é válida!`);
			await collectedMessage.message.delete();
			i--;
		}
		else {
			await collectedMessage.message.delete();
			// Verifica se a tentativa esta correta ou não
			if (collectedMessage.content === correctWord) {
				gameMessage[`line${i + 1}`] = await convertContentToEmojis(collectedMessage.content, correctWord);
				await interaction.editReply(`Parabéns, você acertou em ${i + 1} tentativas! :tada:\n\n${returnGameTable()}`);
				await itPlayed(interaction.user.id);
				i = 7;
			}
			else {
				gameMessage[`line${i + 1}`] = await convertContentToEmojis(collectedMessage.content, correctWord);
				await interaction.editReply(`Adivinhe o **PALAVRECO** de hoje! :eyes:\n\n${returnGameTable()}`);
				if (i === 5) {
					await interaction.editReply(`Você perdeu, a palavra era **${correctWord}**. :frowning:\nQuem sabe na próxima você consegue!\n\n${returnGameTable()}`);
					await itPlayed(interaction.user.id);
					return;
				}
				continue;
			}
		}
	}
}

// Função que retorna a mensagem do usuário
function awaitMessage(interaction) {
	const filter = (msg) => interaction.user.id === msg.author.id;
	const sendedMessage = interaction.channel.awaitMessages({ max: 1, filter }).then((msg) => {
		const response = { content: '', message: msg.first() };
		const content = msg.first().content;
		if (content) {
			response.content.trim().toLowerCase();
			response.content = content;
		}

		return response;
	});

	return sendedMessage;
}

// Função que retorna a palavra escrita em emojis
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
		input: fs.createReadStream('src/utils/palavras.txt'),
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