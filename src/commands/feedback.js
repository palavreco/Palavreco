const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageActionRow, MessageButton, MessageEmbed } = require('discord.js');

async function collector(interaction, message, embed) {
	const filterReaction = (reaction, user) => {
		return !user.bot && Promise.all(['🟩', '🟨', '🟥'].map((emoji) => reaction.emoji.name === emoji));
	};

	const collectorReaction = message.createReactionCollector({ filter: filterReaction });

	collectorReaction.on('collect', async (reaction, user) => {
		const isSuggestion = interaction.options.getSubcommand() === 'sugestão';

		if (reaction.emoji.name === '🟩') {
			try {
				await interaction.user.send(
					`Olá! Obrigado ${isSuggestion ? 'pela sugestão' : 'por reportar o bug'}. A equipe de desenvolvedores agradece!`,
				);
			}
			catch {
				await message.channel.send('Não foi possível enviar a mensagem na dm do usuário.');
			}

			await embed
				.setColor('GREEN')
				.setFooter({
					text: `${isSuggestion ? 'Sugerido' : 'Reportado'} por ${interaction.user.username} (${interaction.user.id}) - Aprovado por ${user.username}`,
					iconURL: interaction.user.avatarURL(),
				});

			await message.edit({ embeds: [embed] });
			await message.pin();
		}
		else if (reaction.emoji.name === '🟨') {
			const messageAnswer = await message.channel.send('Escreva a resposta:');

			const filter = (msg) => user.id === msg.author.id;
			const sendedMessage = await message.channel.awaitMessages({ max: 1, filter }).then(msg => {
				return msg.first();
			});

			await messageAnswer.delete();

			try {
				await interaction.user.send(
					`Olá! Obrigado ${isSuggestion ? 'pela sugestão' : 'por reportar o bug'}.\nA equipe de desenvolvedores te respondeu!\n\n**Resposta:** ${sendedMessage.content}`,
				);
			}
			catch {
				await message.channel.send('Não foi possível enviar a mensagem na dm do usuário.');
			}

			embed
				.setColor('YELLOW')
				.setFooter({
					text: `${isSuggestion ? 'Sugerido' : 'Reportado'} por ${interaction.user.username} (${interaction.user.id}) - Resposta por ${user.username}: "${sendedMessage.content}"`,
					iconURL: interaction.user.avatarURL(),
				});

			await sendedMessage.delete();
			await message.edit({ embeds: [embed] });
		}
		else if (reaction.emoji.name === '🟥') {
			embed
				.setColor('RED')
				.setFooter({
					text: `${isSuggestion ? 'Sugerido' : 'Reportado'} por ${interaction.user.username} (${interaction.user.id}) - Negado por ${user.username}`,
					iconURL: interaction.user.avatarURL(),
				});

			await message.edit({ embeds: [embed] });
		}

		await message.reactions.removeAll();
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
		await interaction.deferReply({ ephemeral: true });

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

			await interaction.editReply({
				embeds: [operationEmbed],
				components: [row],
				fetchReply: true,
			});

			const confirmation = await checkTheCollectorResponse();

			if (confirmation === 'cancel') return;

			await interaction.editReply({
				content: 'Sugestão enviada. Obrigado!',
				embeds: [],
				components: [],
			});

			const suggestionChannel = interaction.client.channels.cache.get(process.env.SUGGESTION_CHANNEL_ID);

			finalEmbed.setDescription('```' + suggestion + '```');
			const messageSuggestion = await suggestionChannel.send({ embeds: [finalEmbed] });
			await Promise.all(['🟩', '🟨', '🟥'].map((emoji) => messageSuggestion.react(emoji)));

			await collector(interaction, messageSuggestion, finalEmbed);
		}
		else {
			const bug = await interaction.options.getString('texto');
			operationEmbed.setDescription(bug);

			await interaction.editReply({
				embeds: [operationEmbed],
				components: [row],
				fetchReply: true,
			});

			const confirmation = await checkTheCollectorResponse();

			if (confirmation === 'cancel') return;

			await interaction.editReply({
				content: 'Reporte enviado. Obrigado!',
				embeds: [],
				components: [],
			});

			const bugReportChannel = interaction.client.channels.cache.get(process.env.BUG_REPORT_CHANNEL_ID);

			finalEmbed.setDescription('```' + bug + '```');
			const messageBug = await bugReportChannel.send({ embeds: [finalEmbed] });
			await Promise.all(['🟩', '🟨', '🟥'].map((emoji) => messageBug.react(emoji)));

			await collector(interaction, messageBug, finalEmbed);
		}
	},
};