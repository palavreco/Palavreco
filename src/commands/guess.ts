import dayjs from 'dayjs';
import { CommandInteraction, MessageActionRow, MessageButton, PermissionString } from 'discord.js';
import { RESTPostAPIChatInputApplicationCommandsJSONBody } from 'discord-api-types/v10';
import { Command } from '../interfaces/Command';
import { t } from '../utils/replyHelper';
import { getUserStatus, registerUser, getDay, getWord, setPlayed, verifyWord } from '../database';
import { runAtMidnight } from '../utils/runner';
import { awaitMessage } from '../utils/msgCollector';
import { isValid } from '../utils/checkWord';
import { toDefault, toEmoji } from '../utils/converters';
import { platform } from '../utils/platform';
import { check, square } from '../utils/emotes.json';

let usersTries: Record<string, { id: string, attempts: string[] }> = {};
let activeGames: string[] = [];

runAtMidnight(() => {
	usersTries = {};
	activeGames = [];
});

export default class Guess implements Command {
	commandStructure: RESTPostAPIChatInputApplicationCommandsJSONBody = {
		'name': 'adivinhar',
		'description': 'Tente adivinhar a palavra do dia!',
	};

	dev = false;

	permissions: PermissionString[] = ['MANAGE_MESSAGES', 'VIEW_CHANNEL'];

	async execute(interaction: CommandInteraction) {
		if (await verifyWord()) {
			usersTries = {};
			activeGames = [];
		}

		const { user, channel } = interaction;

		if (await getUserStatus(user.id) === 'not_registered') {
			registerUser(user.id);
		} else if (await getUserStatus(user.id) === 'registered_active') {
			interaction.reply({
				content: t('already_played', {
					redTick: check.red, timestamp: dayjs().tz('America/Sao_Paulo').endOf('day').unix() + 1,
				}), ephemeral: true,
			});
			return;
		}

		const gameMessage: Record<number, string> = {};
		for (let i = 0; i < 6; i++) gameMessage[i + 1] = square.gray.repeat(5);

		function table(): string {
			const u = usersTries[user.id];
			if (u) {
				for (let i = 0; i < 6; i++) {
					if (u.attempts[i]) {
						gameMessage[i + 1] = u.attempts[i];
					} else {
						gameMessage[i + 1] = square.gray.repeat(5);
					}
				}
			}

			return Object.values(gameMessage).join('\n');
		}


		const playingUser: { id: string, attempts: string[] } = { id: user.id, attempts: [] };
		const correctWord = await getWord();
		const day = await getDay();

		let i = 0;
		if (activeGames.includes(user.id)) {
			await interaction.reply({ content: t('already_playing', { redTick: check.red }), ephemeral: true });

			return;
		} else {
			activeGames.push(user.id);

			await interaction.reply({ content: t('game_message', { table: table() }), ephemeral: true });

			const u = usersTries[user.id];
			if (u) {
				i = u.attempts.length;
			} else {
				usersTries[user.id] = playingUser;
			}
		}

		for (i; i < 6; i++) {
			const input = await awaitMessage(interaction);
			setTimeout(() => {
				input.message!.delete();
			}, 300);

			const word = input.content.normalize('NFKD').replace(/\p{Diacritic}/gu, '');
			if (word === 'cancelar') {
				await interaction.editReply('Você encerrou o jogo :(');
				activeGames.splice(activeGames.indexOf(user.id), 1);

				i = 7;
			} else if (word.length != 5) {
				await interaction.editReply(t('not_five_letters', { table: table() }));

				i--;
			} else if (!await isValid(word)) {
				await interaction.editReply(t('invalid_word', { table: table() }));

				i--;
			} else {
				const row = new MessageActionRow().addComponents(
					new MessageButton().setCustomId('pc-ios').setLabel('PC ou iOS').setStyle('SUCCESS'),
					new MessageButton().setCustomId('android').setLabel('Android').setStyle('SUCCESS'),
				);

				const { attempts } = usersTries[user.id];
				if (Array.isArray(attempts)) attempts.push(toEmoji(word, correctWord));

				if (word === correctWord) {
					await interaction.editReply(t('game_win', { attempts: i + 1, table: table() }));
					setPlayed(user.id);

					activeGames.splice(activeGames.indexOf(user.id), 1);
					delete usersTries[user.id];

					const msg = await channel!.send({ content: t('platform_ask', { user }), components: [row] });

					if (await platform(interaction) === 'pc-ios') {
						await msg.delete();

						await channel!.send(t('identifier', { user }));
						await channel!.send(t('game_result_win', {
							day, attempts: i + 1, finalTable: toDefault(table()),
						}));
					} else {
						await msg.delete();

						await channel!.send(t('identifier', { user }));
						await channel!.send('```' + t('game_result_win', {
							day, attempts: i + 1, finalTable: toDefault(table()),
						}) + '```');
					}

					break;
				} else {
					await interaction.editReply(t('game_message', { table: table() }));

					if (i === 5) {
						await interaction.editReply(t('game_lose', { table: table(), cw: correctWord.toUpperCase() }));

						setPlayed(user.id);

						activeGames.splice(activeGames.indexOf(user.id), 1);
						delete usersTries[user.id];

						const msg = await channel!.send({ content: t('platform_ask', { user }), components: [row] });

						if (await platform(interaction) === 'pc-ios') {
							await msg.delete();

							await channel!.send(t('identifier', { user }));
							await channel!.send(t('game_result_lose', {
								day, attempts: i + 1, finalTable: toDefault(table()),
							}));
						} else {
							await msg.delete();

							await channel!.send(t('identifier', { user }));
							await channel!.send('```' + t('game_result_lose', {
								day, attempts: i + 1, finalTable: toDefault(table()),
							}) + '```');
						}

						return;
					}

					continue;
				}
			}
		}
	}
}