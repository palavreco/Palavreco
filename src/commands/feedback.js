const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');

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
		if (interaction.options.getSubcommand() === 'sugestão') {
			const suggestion = await interaction.options.getString('texto');

			const embedSuggestion = new MessageEmbed()
				.setTitle('Deseja confirmar sua sugestão?')
				.setDescription('```' + suggestion + '```');

			const message = await interaction.reply({ embeds: [embedSuggestion], fetchReply: true });
			await message.react('✅');
			await message.react('❌');

			const finalEmbed = new MessageEmbed()
				.setTitle('Nova Sugestão')
				.setDescription('```' + suggestion + '```')
				.setFooter({ text: `Sugerido por: ${interaction.member.user.username}#${interaction.member.user.discriminator} (${interaction.member.id})` });

			const channel = message.guild.channels.cache.get('937127255082160230');

			const filter = (reaction, user) => {
				return reaction.emoji.name === '✅' || reaction.emoji.name === '❌' && user.id === interaction.member.id;
			};

			const collector = message.createReactionCollector({ filter, time: 30_000 });

			collector.on('collect', async (reaction) => {
				if (reaction.emoji.name === '✅') {
					await message.delete();
					await channel.send({ embeds: [finalEmbed] });
					await interaction.followUp({ content: 'Sugestão Enviada! Obrigado!', ephemeral: true });
				}
				else if (reaction.emoji.name === '❌') {
					await message.delete();
					await interaction.followUp({ content: 'Sugestão Cancelada!', ephemeral: true });
				}
			});
		}

		else if (interaction.options.getSubcommand() === 'bug') {
			const bug = interaction.options.getString('texto');

			const embedBug = new MessageEmbed()
				.setTitle('Deseja confirmar o envio do bug?')
				.setDescription('```' + bug + '```');

			const message = await interaction.reply({ embeds: [embedBug], fetchReply: true });
			await message.react('✅');
			await message.react('❌');

			const finalEmbed = new MessageEmbed()
				.setTitle('Report de Bug')
				.setDescription('```' + bug + '```')
				.setFooter({ text: `${interaction.member.user.username}#${interaction.member.user.discriminator} (${interaction.member.id})` });

			const channel = message.guild.channels.cache.get('937553197378179193');

			const filter = (reaction, user) => {
				return reaction.emoji.name === '✅' || reaction.emoji.name === '❌' && user.id === interaction.member.id;
			};

			const collector = message.createReactionCollector({ filter, time: 30_000 });

			collector.on('collect', async (reaction) => {
				if (reaction.emoji.name === '✅') {
					await message.delete();
					await channel.send({ embeds: [finalEmbed] });
					await interaction.followUp({ content: 'Obrigado por reportar!', ephemeral: true });
				}
				else if (reaction.emoji.name === '❌') {
					await message.delete();
					await interaction.followUp({ content: 'Report cancelado!', ephemeral: true });
				}
			});

		}
	},
};