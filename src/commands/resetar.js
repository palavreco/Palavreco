const { SlashCommandBuilder } = require('@discordjs/builders');
const { resetPlayedUser } = require('../functions/database.js');
const { check } = require('../utils/emotes.json');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('resetar')
		.setDescription('Reseta o booleano de um usuário')
		.addUserOption(option => option.setName('user').setDescription('Usuário que será resetado').setRequired(true)),
	async execute(interaction) {
		const user = interaction.options.getUser('user');

		if (await resetPlayedUser(user.id) == 'alreadyFalse') interaction.reply(`${check['red']} | ${user.tag} (\`${user.id}\`) já está resetado.`);
		else interaction.reply(`${check['green']} | ${user.tag} (\`${user.id}\`) foi resetado.`);
	},
};