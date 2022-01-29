const { SlashCommandBuilder } = require('@discordjs/builders');

let dayWord = '';

module.exports = {
	data: new SlashCommandBuilder()
		.setName('novapalavra')
		.setDescription('Seta a palavra do dia')
		.addStringOption(option => option.setName('palavra').setDescription('A palavra do dia').setRequired(true)),
	async execute(interaction) {
		const wordGetted = await interaction.options.getString('palavra');

		if (wordGetted.length != 5) {
			interaction.reply('A palavra precisa ser de 5 letras.');
		}
		else {
			dayWord = wordGetted;
			await interaction.reply(`A palavra do dia foi setada para \`${dayWord}\`, vamos ver se eles conseguem descobrir. <:muhaha:838625876098678784>`);
		}
	},
	returnDayWord() {
		return dayWord;
	},
};