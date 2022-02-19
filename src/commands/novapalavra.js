const { SlashCommandBuilder } = require('@discordjs/builders');
const { newWord } = require('../functions/database.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('novapalavra')
		.setDescription('Muda a palavra do dia'),
	async execute(interaction) {
		await newWord();
		await interaction.reply('Palavra do dia alterada com sucesso!');
	},
};