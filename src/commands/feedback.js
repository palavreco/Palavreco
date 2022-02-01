const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageActionRow, MessageButton, MessageEmbed } = require('discord.js');
const { suggestionChannelId, bugReportChannelId } = require('../secrets.json');

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
		const operationEmbed = new MessageEmbed()
			.setColor('#2f3136')
			.setTitle(interaction.options.getSubcommand() === 'sugestão' ? 'Confirmar sugestão=' : 'Confirmar reporte?');

		const finalEmbed = new MessageEmbed()
			.setTitle(interaction.options.getSubcommand() === 'sugestão' ? 'Nova sugestão' : 'Reporte de bug')
			.setFooter(interaction.options.getSubcommand() === 'sugestão' ? { text: `Sugerido por ${interaction.user.username} (${interaction.user.id})`, iconURL: interaction.user.avatarURL() } : { text: `Reportado por ${interaction.user.username} (${interaction.user.id})`, iconURL: interaction.user.avatarURL() });

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

		async function checkTheCollectorResponse() {
			const filter = (button) => button.user.id === interaction.user.id && button.message.interaction.id === interaction.id;
			const confirmation = await interaction.channel.awaitMessageComponent({ filter, time: 90_000 })
				.then(int => {
					if (int.isButton()) {
						return int.customId === 'confirm';
					}
				});

			if (!confirmation) {
				await interaction.editReply({
					content: 'Operação cancelada.',
					embeds: [],
					components: [],
				});
				return;
			}
		}

		if (interaction.options.getSubcommand() === 'sugestão') {
			const suggestion = await interaction.options.getString('texto');
			operationEmbed.setDescription(suggestion);

			const interactionMessage = await interaction.reply({
				embeds: [operationEmbed],
				components: [row],
				fetchReply: true,
				ephemeral: true,
			});

			await checkTheCollectorResponse();

			await interaction.editReply({
				content: 'Sugestão enviada. Obrigado!',
				embeds: [],
				components: [],
			});

			finalEmbed.setDescription('```' + suggestion + '```');
			const suggestionChannel = interactionMessage.guild.channels.cache.get(suggestionChannelId);
			await suggestionChannel.send({ embeds: [finalEmbed] });
		}
		else {
			const bug = await interaction.options.getString('texto');
			operationEmbed.setDescription(bug);

			const interactionMessage = await interaction.reply({
				embeds: [operationEmbed],
				components: [row],
				fetchReply: true,
				ephemeral: true,
			});

			await checkTheCollectorResponse();

			await interaction.editReply({
				content: 'Reporte enviado. Obrigado!',
				embeds: [],
				components: [],
			});

			finalEmbed.setDescription('```' + bug + '```');
			const bugReportChannel = interactionMessage.guild.channels.cache.get(bugReportChannelId);
			await bugReportChannel.send({ embeds: [finalEmbed] });
		}
	},
};