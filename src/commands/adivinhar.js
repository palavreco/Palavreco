const { SlashCommandBuilder } = require('@discordjs/builders');
const { square, letter } = require('../utils/emotes.json');
const { returnDayWord } = require('./novapalavra.js');
const fs = require('fs');
const readline = require('readline');

async function checkAttemptsAndSendResults(interaction) {
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

	const correctWord = returnDayWord();
	// Vefifica se a palavra já foi setada
	if (correctWord === '') {
		await interaction.editReply('Não há palavra do dia, use o comando `/novapalavra` para setar uma.');
		return;
	}

	for (let i = 0; i < 6; i++) {
		const collectedMessage = await awaitMessage(interaction);

		// Verifica se a mensagem pode ser realmente considerada como uma tentativa
		if (collectedMessage.content.length != 5) {
			await interaction.editReply(`Adivinhe o **PALAVRECO** de hoje! :eyes:\n\n${returnGameTable()}\n**Atenção:** A palavra deve ter 5 letras!`);
			await collectedMessage.message.delete();
			i--;
		}
		else if (await checkWordIsValid(collectedMessage.content) === false) {
			await interaction.editReply(`Adivinhe o **PALAVRECO** de hoje! :eyes:\n\n${returnGameTable()}\n**Atenção:** A palavra não é válida! Se caso ela for uma palavra, reporte dando /feedback bug :heart:`);
			await collectedMessage.message.delete();
			i--;
		}
		else {
			await collectedMessage.message.delete();

			// Verifica se a tentativa esta correta ou não
			if (collectedMessage.content === correctWord) {
				gameMessage[`line${i + 1}`] = await convertContentToEmojis(collectedMessage.content, correctWord);
				await interaction.editReply(`Parabéns, você acertou em ${i + 1} tentativas! :tada:\n\n${returnGameTable()}`);
				i = 7;
			}
			else {
				gameMessage[`line${i + 1}`] = await convertContentToEmojis(collectedMessage.content, correctWord);
				await interaction.editReply(`Adivinhe o **PALAVRECO** de hoje! :eyes:\n\n${returnGameTable()}`);
				continue;
			}
		}
	}

	Object.values(gameMessage).forEach(line => line.replace(line, `${square['gray'].repeat(5)}`));
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
		await checkAttemptsAndSendResults(interaction);
	},
};