import { CommandInteraction, MessageEmbed, User } from 'discord.js';
import { Command, CommandData, OptionType } from '../interfaces';
import { getUser } from '../database';
import { makeStats } from '../utils';

export default class Stats implements Command {
	commandStructure: CommandData = {
		name: 'stats',
		description: 'Mostra as estatísticas de um usuário',
		options: [
			{
				name: 'user',
				description: 'O usuário que deseja ver as estatísticas',
				type: OptionType.User,
				required: false,
			},
		],
	};

	dev = false;

	async execute(interaction: CommandInteraction) {
		const { options, user } = interaction;
		const target = options.getUser('user') ?? user;

		const u = await getUser(target.id);
		if (!u?.guesses) {
			return interaction.reply(
				`❌ **${target.tag}** não tem nenhuma estatística!`,
			);
		}

		const { gameswins, streak, guesses } = u;
		const stats = { gameswins, streak, guesses };

		interaction.reply({ embeds: [this.makeEmbed(stats, target)] });
	}

	makeEmbed(
		stats: { gameswins: number[]; streak: number[]; guesses: number[] },
		user: User,
	) {
		const { gameswins, streak, guesses } = stats;
		const [games, wins, currentStreak, bestStreak] = [
			gameswins[0],
			gameswins[1],
			streak[0],
			streak[1],
		];

		const sum = guesses.reduce((a, b) => a + b, 0);
		const percentages = guesses.map((g) => Math.round((g / sum) * 100));
		percentages.push(110);

		const guessesDistribution = makeStats(percentages);
		const hasStreak = currentStreak >= 5 ? ' 🔥' : '';

		return new MessageEmbed()
			.setTitle(user.tag)
			.setThumbnail(user.displayAvatarURL())
			.setColor('#2f3136')
			.setImage(guessesDistribution)
			.addFields([
				{ name: 'Jogos', value: '```' + `${games}` + '```', inline: true },
				{ name: 'Vitórias', value: '```' + `${wins}` + '```', inline: true },
				{
					name: '% de vitórias',
					value: '```' + `${Math.round((wins / games) * 100)}%` + '```',
					inline: true,
				},
				{
					name: 'Sequência de vitórias',
					value: '```' + `${currentStreak}${hasStreak}` + '```',
					inline: true,
				},
				{
					name: 'Melhor sequência',
					value: '```' + `${bestStreak}` + '```',
					inline: true,
				},
			]);
	}
}
