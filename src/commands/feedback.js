const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageActionRow, MessageButton, MessageEmbed } = require('discord.js');

async function collector(interaction, message, embed) {

	const filterReaction = (user) => {
		return !user.bot;
	};

	const collectorReaction = message.createReactionCollector({ filter: filterReaction });

	collectorReaction.on('collect', async (reaction, user) => {
		await message.reactions.removeAll();
		if (reaction.emoji.name === '🟩') {
			try {
				interaction.options.getSubcommand() === 'sugestão' ? await interaction.user.send('Olá! Obrigado pela sugestão! A equipe de desenvolvedores agradece!') : await interaction.user.send('Olá! Obrigado por reportar o bug! A equipe de desenvolvedores já está ciente do mesmo e logo logo ele estará resolvido!');
			}
			catch {
				await message.channel.send('Não foi possível enviar a mensagem na dm do usuário.');
			}
			embed.setColor('GREEN');
			interaction.options.getSubcommand() === 'sugestão' ? embed.setFooter({ text: `Sugerido por ${interaction.user.username} (${interaction.user.id}) - Aprovado por ${user.username}`, iconURL: interaction.user.avatarURL() }) : embed.setFooter({ text: `Reportado por ${interaction.user.username} (${interaction.user.id}) - Aprovado por ${user.username}`, iconURL: interaction.user.avatarURL() });
			await message.edit({ embeds: [embed] });
			message.pin();
		}
		else if (reaction.emoji.name === '🟨') {
			const messageAnswer = await message.channel.send('Escreva a resposta:');

			const filter = (msg) => user.id === msg.author.id;
			const sendedMessage = await message.channel.awaitMessages({ max: 1, filter }).then(msg => {
				return msg.first();
			});
			await messageAnswer.delete();
			try {
				interaction.options.getSubcommand() === 'sugestão' ? await interaction.user.send(`Olá! Obrigado pela sugestão! A equipe de desenvolvedores te respondeu!\n\nResposta: ${sendedMessage.content}`) : await interaction.user.send(`Olá! Obrigado por reportar o bug! A equipe de desenvolvedores te respondeu!\n\nResposta: ${sendedMessage.content}`);
			}
			catch {
				await message.channel.send('Não foi possível enviar a mensagem na dm do usuário.');
			}
			interaction.options.getSubcommand() === 'sugestão' ? embed.setFooter({ text: `Sugerido por ${interaction.user.username} (${interaction.user.id}) - Resposta por ${user.username}: "${sendedMessage.content}"`, iconURL: interaction.user.avatarURL() }) : embed.setFooter({ text: `Reportado por ${interaction.user.username} (${interaction.user.id}) - Resposta por ${user.username}: "${sendedMessage.content}"`, iconURL: interaction.user.avatarURL() });
			embed.setColor('YELLOW');
			await sendedMessage.delete();
			await message.edit({ embeds: [embed] });
		}
		else if (reaction.emoji.name === '🟥') {
			embed.setColor('RED');
			interaction.options.getSubcommand() === 'sugestão' ? embed.setFooter({ text: `Sugerido por ${interaction.user.username} (${interaction.user.id}) - Negado por ${user.username}`, iconURL: interaction.user.avatarURL() }) : embed.setFooter({ text: `Reportado por ${interaction.user.username} (${interaction.user.id}) - Negado por ${user.username}`, iconURL: interaction.user.avatarURL() });
			await message.edit({ embeds: [embed] });
		}
	});
}

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
			.setTitle(interaction.options.getSubcommand() === 'sugestão' ? 'Confirmar sugestão?' : 'Confirmar reporte?');

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
				return 'cancel';
			}
		}

		if (interaction.options.getSubcommand() === 'sugestão') {
			const suggestion = await interaction.options.getString('texto');
			operationEmbed.setDescription(suggestion);

			await interaction.reply({
				embeds: [operationEmbed],
				components: [row],
				fetchReply: true,
				ephemeral: true,
			});

			const confirmation = await checkTheCollectorResponse();

			if (confirmation === 'cancel') return;

			await interaction.editReply({
				content: 'Sugestão enviada. Obrigado!',
				embeds: [],
				components: [],
			});

			finalEmbed.setDescription('```' + suggestion + '```');
			const suggestionChannel = interaction.client.channels.cache.get(process.env.SUGGESTION_CHANNEL_ID);
			const messageSuggestion = await suggestionChannel.send({ embeds: [finalEmbed] });
			await messageSuggestion.react('🟩');
			await messageSuggestion.react('🟨');
			await messageSuggestion.react('🟥');

			collector(interaction, messageSuggestion, finalEmbed);
		}
		else {
			const bug = await interaction.options.getString('texto');
			operationEmbed.setDescription(bug);

			await interaction.reply({
				embeds: [operationEmbed],
				components: [row],
				fetchReply: true,
				ephemeral: true,
			});

			const confirmation = await checkTheCollectorResponse();

			if (confirmation === 'cancel') return;

			await interaction.editReply({
				content: 'Reporte enviado. Obrigado!',
				embeds: [],
				components: [],
			});

			finalEmbed.setDescription('```' + bug + '```');
			const bugReportChannel = interaction.client.channels.cache.get(process.env.BUG_REPORT_CHANNEL_ID);
			const messageBug = await bugReportChannel.send({ embeds: [finalEmbed] });
			await messageBug.react('🟩');
			await messageBug.react('🟨');
			await messageBug.react('🟥');

			collector(interaction, messageBug, finalEmbed);
		}
	},
};