import { CommandInteraction } from 'discord.js';
import { ApplicationCommandOptionType, RESTPostAPIChatInputApplicationCommandsJSONBody } from 'discord-api-types/v10';
import { Command } from '../interfaces/Command';
import { getAllGuesses } from '../database';
import { makeImage } from '../utils/image';

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
		const { options, guild } = interaction;
		const isServer = options.getSubcommand() === 'server';
		const globalUsers = await getAllGuesses();

		const serverOrGlobal = () => {
			if (isServer) {
				return globalUsers.filter(async g => Boolean(await guild!.members.fetch(g.id)));
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

		interaction.reply({ files: [await makeImage(isServer, scores, interaction)] });
	}
}
