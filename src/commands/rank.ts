import { CommandInteraction } from 'discord.js';
import { ApplicationCommandOptionType, RESTPostAPIChatInputApplicationCommandsJSONBody } from 'discord-api-types/v10';
import { Command } from '../interfaces/Command';
import { getAllGuesses } from '../database';
import { makeImage } from '../utils/image';
import { check } from '../utils/assets.json';

export default class Rank implements Command {
	commandStructure: RESTPostAPIChatInputApplicationCommandsJSONBody = {
		name: 'rank',
		description: 'Mostra o rank dos usuários',
		options: [
			{
				name: 'server',
				description: 'Mostra o rank do servidor',
				type: ApplicationCommandOptionType.Subcommand,
			},
			{
				name: 'global',
				description: 'Mostra o rank global',
				type: ApplicationCommandOptionType.Subcommand,
			},
		],
	};

	dev = false;

	async execute(interaction: CommandInteraction) {
		const { options, guildId } = interaction;
		const isServer = options.getSubcommand() === 'server';
		const globalUsers = await getAllGuesses();

		if (!guildId && isServer) {
			interaction.reply(`${check.red} Não é possível mostrar o rank do servidor sem estar em um servidor.`);
			return;
		}

		const serverOrGlobal = () => {
			if (isServer) {
				return globalUsers.filter(u => u.guilds.includes(guildId!));
			} else {
				return globalUsers;
			}
		};

		const scores = serverOrGlobal().map(user => {
			const { id, one, two, three, four, five, six, losses } = user;
			let points = (one * 3) + (two * 2) + three + (four * 0.75) + (five * 0.5) + (six * 0.25) - losses;
			if (points < 0) points = 0;

			return { id, points };
		}).sort((a, b) => b.points - a.points);

		if (!scores.length) {
			interaction.reply(`${check.red} Não há nenhum usuário no rank.`);
			return;
		}

		await interaction.deferReply();
		await interaction.editReply({ files: [await makeImage(isServer, scores, interaction)] });
	}
}
