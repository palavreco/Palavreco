const { SlashCommandBuilder } = require('@discordjs/builders');
const { newWord } = require('../utils/database.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('novapalavra')
		.setDescription('Muda a palavra do dia'),
	async execute(interaction) {
		newWord();
		interaction.reply('Palavra do dia mudada com sucesso!');
	},
};