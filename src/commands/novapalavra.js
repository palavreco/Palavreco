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
			dayWord = dayWord.toLowerCase();
			await interaction.reply(`A palavra do dia foi setada para \`${dayWord}\`.`);
		}
	},
	returnDayWord() {
		return dayWord;
	},
};