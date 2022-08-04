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
import { t } from '../utils/replyHelper';
import { check, letter } from '../utils/assets.json';

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
			.setTitle(t('confirm_operaction', { part: isSug ? t('suggestion') : t('report') }))
			.setDescription(content!);

		const row = new MessageActionRow().addComponents(
			new MessageButton().setCustomId('confirm').setLabel('✔').setStyle('SUCCESS'),
			new MessageButton().setCustomId('cancel').setLabel('✖').setStyle('DANGER'),
		);

		await interaction.reply({ embeds: [confEmb], components: [row], ephemeral: true });

		const colResp = await collector(channel, interaction);
		const confirmed = colResp === 'confirm';
		await interaction.editReply({ content: confirmed
			? t('success_operation', { greenTick: check.green })
			: t('cancelled_operation', { redTick: check.red }), embeds: [], components: [],
		});

		if (confirmed) {
			const channelId = isSug ? process.env.SUG_CHANNEL : process.env.BUG_CHANNEL;
			const c = client.channels.cache.get(channelId) as TextBasedChannel;

			const emb = new MessageEmbed()
				.setColor('#2f3136')
				.addField(isSug ? 'Suggestion' : 'Report', content!)
				.setFooter({ text: `Sent by ${user.tag} (${user.id})`, iconURL: user.displayAvatarURL() });

			const message = await c.send({ content: isSug ? 'New suggestion' : 'Bug report', embeds: [emb] });
			handleOperation(message, emb, isSug, user);
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

function handleOperation(msg: Message, embed: MessageEmbed, isSug: boolean, user: User) {
	['🟩', '🟨', '🟥'].map(e => msg.react(e));

	const filter = (r: MessageReaction, u: User) => !u.bot && ['🟩', '🟨', '🟥'].includes(r.emoji.name!);
	const reactionCollector = msg.createReactionCollector({ filter });

	reactionCollector.on('collect', async (r, u) => {
		switch (r.emoji.name) {
		case '🟩': {
			embed
				.setColor('GREEN')
				.setFooter({ text: `${embed.footer?.text} - Accepted by ${u.tag}`, iconURL: user.displayAvatarURL() });

			await msg.edit({ content: isSug ? 'Suggestion accepted' : 'Report accepted', embeds: [embed] });
			await msg.pin();

			user.send(t('feedback_thanks', {
				p: letter.green.p,
				part: isSug ? t('feedback_sug') : t('feedback_bug'),
			})).catch(() => {
				msg.channel.send(`${check.red} **${u.tag}** can't receive DMs.`);
			});

			break;
		}

		case '🟨': {
			const ask = await msg.channel.send('**Write your answer:**');

			const f = (m: Message) => m.author.id === u.id && m.channel.id === msg.channel.id;
			const ans = await msg.channel.awaitMessages({ filter: f, max: 1 }).then(m => m.first());
			ask.delete();

			embed
				.setColor('YELLOW')
				.addField('Answer', ans!.content)
				.setFooter({ text: `${embed.footer?.text} - Answered by ${u.tag}`, iconURL: user.displayAvatarURL() });
			await msg.edit({ content: isSug ? 'Suggestion answered' : 'Report answered', embeds: [embed] });

			user.send(t('feedback_thanks_answer', {
				p: letter.green.p,
				part: isSug ? t('feedback_sug') : t('feedback_bug'),
				answer: ans!.content,
			})).catch(() => {
				msg.channel.send(`${check.red} **${u.tag}** can't receive DMs.`);
			});

			ans?.delete();

			break;
		}
		case '🟥': {
			embed
				.setColor('RED')
				.setFooter({ text: `${embed.footer?.text} - Rejected by ${u.tag}`, iconURL: user.displayAvatarURL() });
			await msg.edit({ content: isSug ? 'Suggestion rejected' : 'Report rejected', embeds: [embed] });

			break;
		}
		}

		await msg.reactions.removeAll();
	});
}
