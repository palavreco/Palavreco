/* eslint-disable max-len */
// pls suggestions, i want make some kind of json file containing all the replies (it would make the translation easier)
import dayjs from 'dayjs';
import { CommandInteraction, MessageActionRow, MessageButton } from 'discord.js';
import { RESTPostAPIChatInputApplicationCommandsJSONBody } from 'discord-api-types/v10';
import { Command } from '../interfaces/Command';
import { checkOrRegisterUser, getDay, getWord, played } from '../database';
import { runAtMidnight } from '../utils/runner';
import { awaitMessage } from '../utils/msgCollector';
import { isValid } from '../utils/checkWord';
import { toDefault, toEmoji } from '../utils/converters';
import { plataform } from '../utils/plataform';
import { hasPermissions } from '../utils/permissions';
import { square } from '../utils/emotes.json';

let usersTries: Record<string, Record<string, string | string[]>> = {};
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

	dev = true;

	async execute(interaction: CommandInteraction) {
		const { user, channel } = interaction;

		if (!hasPermissions(interaction, ['MANAGE_MESSAGES', 'USE_EXTERNAL_EMOJIS'])) return;

		if (await checkOrRegisterUser(user.id)) {
			const t = dayjs().tz('America/Sao_Paulo').endOf('day').unix();
			interaction.reply({
				'content': `Você já jogou hoje!\nTempo restante até a próxima palavra: <t:${t}:R>`,
				'ephemeral': true,
			});
			return;
		}


		const gameMessage: Record<number, string> = Object.create(null);
		for (let i = 0; i < 6; i++) gameMessage[i + 1] = square.gray.repeat(5);

		function table(): string {
			const u = usersTries[user.id];
			if (u) {
				for (let i = 0; i < 6; i++) {
					u.attempts[i] ? gameMessage[i + 1] = u.attempts[i] : gameMessage[i + 1] = square.gray.repeat(5);
				}
			}

			return Object.values(gameMessage).map(line => line).join('\n');
		}


		const playingUser: Record<string, string | string[]> = { id: user.id, attempts: [] };
		const correctWord = await getWord();

		let i = 0;
		if (activeGames.includes(user.id)) {
			await interaction.reply('Você já está jogando!\nSe a mensagem não aparece mais, mande `cancelar` no canal e tente novamente.');
			return;
		} else {
			activeGames.push(user.id);

			await interaction.reply({
				'content': `Adivinhe o **PALAVRECO** de hoje! 👀\n\n${table()}\nPara cancelar o jogo, digite \`cancelar\``,
				'ephemeral': true,
			});

			const u = usersTries[user.id];
			u ? i = u.attempts.length : usersTries[user.id] = playingUser;
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
				await interaction.editReply(`Adivinhe o **PALAVRECO** de hoje! 👀\n\n${table()}\n**Atenção:** A palavra deve ter 5 letras!`);

				i--;
			} else if (await isValid(word) === false) {
				await interaction.editReply(`Adivinhe o **PALAVRECO** de hoje! 👀\n\n${table()}\n**Atenção:** A palavra não é válida!`);

				i--;
			} else {
				const row = new MessageActionRow().addComponents(
					new MessageButton().setCustomId('pc-ios').setLabel('PC ou iOS').setStyle('SUCCESS'),
					new MessageButton().setCustomId('android').setLabel('Android').setStyle('SUCCESS'),
				);

				const { attempts } = usersTries[user.id];
				if (Array.isArray(attempts)) attempts.push(toEmoji(word, correctWord));

				if (word === correctWord) {
					await interaction.editReply(`Parabéns, você acertou em ${i + 1} tentativas! :tada:\n\n${table()}`);
					played(user.id);

					activeGames.splice(activeGames.indexOf(user.id), 1);
					delete usersTries[user.id];

					const msg = await channel!.send({
						'content': `<@${user.id}> Pressione o botão correspondente à plataforma em que está jogando para que seja possível copiar a mensagem e compartilhá-la!`,
						'components': [row],
					});

					if (await plataform(interaction) === 'pc-ios') {
						await msg.edit({ 'content': `Jogo de <@${user.id}>:`, 'components': [] });
						await channel!.send(`Joguei palavreco.com #${await getDay()} ${i + 1}/6\n\n${toDefault(table())}`);
					} else {
						await msg.edit({ 'content': `Jogo de <@${user.id}>:`, 'components': [] });
						await channel!.send(`\`\`\`\nJoguei palavreco.com #${await getDay()} ${i + 1}/6\n\n${toDefault(table())}\n\`\`\``);
					}

					i = 7;
				} else {
					await interaction.editReply(`Adivinhe o **PALAVRECO** de hoje! 👀\n\n${table()}`);

					if (i === 5) {
						await interaction.editReply(`${table()}\n\nVocê perdeu, a palavra era **${correctWord}**. :frowning:\nQuem sabe na próxima você consegue!`);

						played(user.id);

						activeGames.splice(activeGames.indexOf(user.id), 1);
						delete usersTries[user.id];

						const msg = await channel!.send({
							'content': `<@${user.id}> Pressione o botão correspondente à plataforma em que está jogando para que seja possível copiar a mensagem e compartilhá-la!`,
							'components': [row],
						});

						if (await plataform(interaction) === 'pc-ios') {
							await msg.edit({ content: `Jogo de <@${user.id}>:`, components: [] });
							await channel!.send(`Joguei palavreco.com #${await getDay()} X/6\n\n${toDefault(table())}`);
						}
						else {
							await msg.edit({ content: `Jogo de <@${user.id}>:`, components: [] });
							await channel!.send(`\`\`\`Joguei palavreco.com #${await getDay()} X/6\n\n${toDefault(table())}\`\`\``);
						}

						return;
					}

					continue;
				}
			}
		}
	}
}
