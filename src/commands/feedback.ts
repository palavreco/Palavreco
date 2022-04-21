import {
	ButtonInteraction,
	CommandInteraction,
	Message,
	MessageActionRow,
	MessageButton,
	MessageEmbed,
	MessageReaction,
	TextBasedChannel,
	User,
} from 'discord.js';
import {
	ApplicationCommandOptionType,
	RESTPostAPIChatInputApplicationCommandsJSONBody,
} from 'discord-api-types/v10';
import { Command } from '../interfaces/Command';
import { check, letter } from '../utils/emotes.json';

export default class FeedBack implements Command {
	commandStructure: RESTPostAPIChatInputApplicationCommandsJSONBody = {
		'name': 'feedback',
		'description': 'Dê um feedback para o Palavreco!',
		'options': [
			{
				'name': 'sugestão',
				'description': 'Sugira algo para o bot',
				'type': ApplicationCommandOptionType.Subcommand,
				'options': [
					{
						'name': 'texto',
						'description': 'Coloque o conteúdo da sugestão',
						'type': ApplicationCommandOptionType.String,
						'required': true,
					},
				],
			},
			{
				name: 'bug',
				description: 'Reporte um bug do bot',
				type: ApplicationCommandOptionType.Subcommand,
				options: [
					{
						name: 'texto',
						description: 'Coloque o conteúdo do reporte',
						type: ApplicationCommandOptionType.String,
						required: true,
					},
				],
			},
		],
	};

	dev = false;

	async execute(interaction: CommandInteraction) {
		const { channel, client, options, user } = interaction;
		const isSug = options.getSubcommand() === 'sugestão';
		const content = options.getString('texto');

		const confEmb = new MessageEmbed()
			.setColor('#2f3136')
			.setTitle(`Confirmar ${isSug ? 'sugestão' : 'reporte'}?`)
			.setDescription(content!);
		const row = new MessageActionRow().addComponents(
			new MessageButton().setCustomId('confirm').setLabel('✔').setStyle('SUCCESS'),
			new MessageButton().setCustomId('cancel').setLabel('✖').setStyle('DANGER'),
		);

		await interaction.reply({ embeds: [confEmb], components: [row], ephemeral: true });

		const colResp = await collector(channel, interaction);
		const confirmed = colResp === 'confirm';
		await interaction.editReply({
			content: confirmed ? `${check.green} Operação concluída. Obrigado!` : `${check.red} Operação cancelada.`,
			embeds: [], components: [],
		});

		if (confirmed) {
			const channelId = isSug ? process.env.SUG_CHANNEL : process.env.BUG_CHANNEL;
			const c = client.channels.cache.get(channelId) as TextBasedChannel;

			const emb = new MessageEmbed()
				.setColor('#2f3136')
				.setTitle(isSug ? 'Nova sugestão' : 'Reporte de bug')
				.setDescription(content!)
				.setFooter({ text: `Enviado por ${user.tag} (${user.id})`, iconURL: user.displayAvatarURL() });

			const message = await c.send({ embeds: [emb] });
			handleOperation(message, emb, isSug);
		}
	}
}

function collector(
	channel: TextBasedChannel | null,
	interaction: CommandInteraction,
): Promise<string> {
	const { user, id } = interaction;

	const filter = (b: ButtonInteraction) => b.user.id === user.id && b.message.interaction!.id === id;
	return channel!.awaitMessageComponent({ filter, time: 90_000, componentType: 'BUTTON' }).then(i => i.customId);
}

function handleOperation(msg: Message, embed: MessageEmbed, isSug: boolean) {
	['🟩', '🟨', '🟥'].map(e => msg.react(e));

	const filter = (r: MessageReaction, u: User) => !u.bot && ['🟩', '🟨', '🟥'].includes(r.emoji.name!);
	const reactionCollector = msg.createReactionCollector({ filter });

	reactionCollector.on('collect', async (r, u) => {
		switch (r.emoji.name) {
		case '🟩': {
			embed
				.setTitle(isSug ? 'Sugestão aceita' : 'Reporte aceito')
				.setColor('GREEN')
				.setFooter({ text: `${embed.footer?.text} - Aceito por ${u.tag}`, iconURL: u.displayAvatarURL() });
			await msg.edit({ embeds: [embed] });
			await msg.pin();

			u.send([
				`${letter.green.p} Olá! Obrigado ${isSug ? 'pela sugestão' : 'por reportar o bug'}.`,
				'**A equipe de desenvolvedores agradece!**',
			].join(' ')).catch(() => {
				msg.channel.send('Não foi possível enviar a mensagem na dm do usuário.');
			});

			break;
		}

		case '🟨': {
			const ask = await msg.channel.send('Escreva a resposta:');

			const f = (m: Message) => m.author.id === u.id && m.channel.id === msg.channel.id;
			const ans = await msg.channel.awaitMessages({ filter: f, max: 1 }).then(m => m.first());
			ask.delete();

			embed
				.setTitle(isSug ? 'Sugestão respondida' : 'Reporte respondido')
				.setColor('YELLOW')
				.addField('Resposta', ans!.content)
				.setFooter({ text: `${embed.footer?.text} - Respondido por ${u.tag}`, iconURL: u.displayAvatarURL() });
			await msg.edit({ embeds: [embed] });

			u.send([
				`${letter.green.p} Olá! Obrigado ${isSug ? 'pela sugestão' : 'por reportar o bug'}.`,
				`A equipe de desenvolvedores te respondeu.\n\n**Resposta:** ${ans?.content}`,
			].join(' ')).catch(() => {
				msg.channel.send('Não foi possível enviar a mensagem na dm do usuário.');
			});

			ans?.delete();

			break;
		}
		case '🟥': {
			embed
				.setTitle(isSug ? 'Sugestão rejeitada' : 'Reporte rejeitado')
				.setColor('RED')
				.setFooter({ text: `${embed.footer?.text} - Rejeitado por ${u.tag}`, iconURL: u.displayAvatarURL() });
			await msg.edit({ embeds: [embed] });

			break;
		}
		}

		await msg.reactions.removeAll();
	});
}
