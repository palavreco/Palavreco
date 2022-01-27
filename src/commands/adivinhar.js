const { SlashCommandBuilder } = require('@discordjs/builders');
const { letter } = require('../utils/emotes.json');

async function awaitMessage(interaction) {
	const filter = (msg) => interaction.user.id === msg.author.id;
	const sendedMessage = await interaction.channel.awaitMessages({ max: 1, filter }).then((msg) => {
		const response = { content: '', message: msg.first() };
		const content = msg.first().content;
		if (content) response.content = content;

		return response;
	});

	return sendedMessage;
}

async function convertMessageContentToEmojis(interaction, content, correctWord) {
	const contentArray = content.split('');
	const correctWordArray = correctWord.split('');

	let finalMessage = '';
	for (let i = 0; i < contentArray.length; i++) {
		if (contentArray[i] === correctWordArray[i]) {
			finalMessage += letter['green'][correctWordArray[i]];
		}
		else if (correctWordArray.includes(contentArray[i])) {
			finalMessage += letter['yellow'][contentArray[i]];
		}
		else {
			finalMessage += letter['gray'][contentArray[i]];
		}
	}

	await interaction.editReply(finalMessage);
}

module.exports = {
	data: new SlashCommandBuilder()
		.setName('adivinhar')
		.setDescription('Tente adivinhar a palavra do dia'),
	async execute(interaction) {
		await interaction.reply('Adivinhe o **WORDLE** de hoje! :eyes:');

		const correctWord = 'teste'; // Apenas para teste, futuramente será retirado

		const receivedMessage = await awaitMessage(interaction);

		if (receivedMessage.content.length != 5) {
			await interaction.editReply('A palavra tem que ter 5 letras!');
			await receivedMessage.message.delete();
		}
		else {
			await convertMessageContentToEmojis(interaction, receivedMessage.content, correctWord);
			await receivedMessage.message.delete();
		}
	},
};
