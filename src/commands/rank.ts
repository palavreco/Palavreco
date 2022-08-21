import { CommandInteraction } from 'discord.js';
import { ApplicationCommandOptionType, RESTPostAPIChatInputApplicationCommandsJSONBody } from 'discord-api-types/v10';
import { Command } from '../interfaces/Command';
import { getRank } from '../database';
import { makeRank } from '../utils/image';

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
		const globalUsers = await getRank();

		if (!guildId && isServer) {
			return interaction.reply('❌ Não é possível mostrar o rank do servidor sem estar em um servidor.');
		}

		const users = () => {
			if (isServer) return globalUsers.filter(u => u.guilds.includes(guildId!));
			else return globalUsers;
		};

		const reference: Record<string, number> = { '0': 3, '1': 2, '2': 1, '3': 0.75, '4': 0.5, '5': 0.25, '6': 0 };
		const scores = users().map(user => {
			const { id, guesses } = user;

			let points = Object.entries(guesses).reduce((acc, [key, value]) => acc + value * reference[key], 0);
			if (points < 0) points = 0;

			return { id, points };
		}).sort((a, b) => b.points - a.points);

		if (!scores.length) {
			interaction.reply('❌ Não há nenhum usuário no rank.');
			return;
		}

		await interaction.deferReply();
		await interaction.editReply({ files: [await makeRank(isServer, scores, interaction)] });
	}
}
