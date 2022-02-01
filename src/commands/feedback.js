const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageActionRow, MessageButton, MessageEmbed } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('feedback')
		.setDescription('Dê uma feedback para o bot!')
		.addSubcommand(subcommand =>
			subcommand
				.setName('sugestão')
				.setDescription('Sugira algo para o bot!')
				.addStringOption(option => option.setName('texto').setDescription('Escreva sua sugestão').setRequired(true)))
		.addSubcommand(subcommand =>
			subcommand
				.setName('bug')
				.setDescription('Reporte um bug do bot!')
				.addStringOption(option => option.setName('texto').setDescription('Descreva o bug').setRequired(true))),
	async execute(interaction) {

		const finalEmbed = new MessageEmbed()
			.setTitle(interaction.options.getSubcommand() === 'sugestão' ? 'Nova Sugestão' : 'Report Bug')
			.setFooter(interaction.options.getSubcommand() === 'sugestão' ? { text: `Sugerido por: ${interaction.user.tag} (${interaction.user.id})`, iconURL: interaction.user.avatarURL() } : { text: `Reportado por: ${interaction.user.tag} (${interaction.user.id})`, iconURL: interaction.user.avatarURL() });

		if (interaction.options.getSubcommand() === 'sugestão') {

			const suggestion = await interaction.options.getString('texto');
			finalEmbed.setDescription('```' + suggestion + '```');

			const row = new MessageActionRow()
				.addComponents(
					new MessageButton()
						.setCustomId('confirm')
						.setLabel('✔')
						.setStyle('SUCCESS'),
					new MessageButton()
						.setCustomId('cancel')
						.setLabel('✖')
						.setStyle('DANGER'),
				);

			const suggestionEmbed = new MessageEmbed()
				.setColor('#2f3136')
				.setTitle('Confirmar sugestão?')
				.setDescription('```' + suggestion + '```');

			const interactionMessage = await interaction.reply({
				embeds: [suggestionEmbed],
				components: [row],
				fetchReply: true,
				ephemeral: true,
			});

			const channel = interactionMessage.guild.channels.cache.get('937127255082160230');

			const filter = (button) => button.user.id === interaction.user.id && button.message.interaction.id === interaction.id;

			const confirmation = await interaction.channel.awaitMessageComponent({ filter, time: 90_000 })
				.then(int => {
					if (int.isButton()) {
						return int.customId === 'confirm';
					}
				});

			if (!confirmation) {
				await interaction.editReply({
					content: 'Sugestão cancelada.',
					embeds: [],
					components: [],
				});
				return;
			}
			await interaction.editReply({
				content: 'Sugestão enviada. Obrigado!',
				embeds: [],
				components: [],
			});
			await channel.send({
				embeds: [finalEmbed],
			});
		}
		else if (interaction.options.getSubcommand() === 'bug') {

			const bug = await interaction.options.getString('texto');
			finalEmbed.setDescription('```' + bug + '```');

			const row = new MessageActionRow()
				.addComponents(
					new MessageButton()
						.setCustomId('confirm')
						.setLabel('✔')
						.setStyle('SUCCESS'),
					new MessageButton()
						.setCustomId('cancel')
						.setLabel('✖')
						.setStyle('DANGER'),
				);

			const bugReportEmbed = new MessageEmbed()
				.setColor('#2f3136')
				.setTitle('Confirmar report?')
				.setDescription('```' + bug + '```');

			const interactionMessage = await interaction.reply({
				embeds: [bugReportEmbed],
				components: [row],
				fetchReply: true,
				ephemeral: true,
			});

			const channel = interactionMessage.guild.channels.cache.get('937553197378179193');

			const filter = (button) => button.user.id === interaction.user.id && button.message.interaction.id === interaction.id;

			const confirmation = await interaction.channel.awaitMessageComponent({ filter, time: 90_000 })
				.then(int => {
					if (int.isButton()) {
						return int.customId === 'confirm';
					}
				});

			if (!confirmation) {
				await interaction.editReply({
					content: 'Report cancelado.',
					embeds: [],
					components: [],
				});
				return;
			}
			await interaction.editReply({
				content: 'Reporte enviado. Obrigado!',
				embeds: [],
				components: [],
			});
			await channel.send({
				embeds: [finalEmbed],
			});
		}
	},
};