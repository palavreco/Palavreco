import { Command } from '../interfaces/Command';
import { CommandInteraction, MessageEmbed, User } from 'discord.js';
import { ApplicationCommandOptionType, RESTPostAPIChatInputApplicationCommandsJSONBody } from 'discord-api-types/v10';
import { getStats } from '../database';
import { Stats } from '../interfaces/Database';
import { makeStats } from '../utils/image';

export default class StatsC implements Command {
	commandStructure: RESTPostAPIChatInputApplicationCommandsJSONBody = {
		name: 'stats',
		description: 'Mostra as estatísticas de um usuário',
		options: [{
			name: 'user',
			description: 'O usuário que deseja ver as estatísticas',
			type: ApplicationCommandOptionType.User,
			required: false,
		}],
	};

	dev = false;

	async execute(interaction: CommandInteraction) {
		const { options, user } = interaction;
		const target = options.getUser('user') ?? user;

		const stats = await getStats(target.id);
		if (!stats) return interaction.reply(`❌ **${target.tag}** não tem nenhuma estatística!`);

		interaction.reply({ embeds: [this.makeEmbed(stats, target)] });
	}

	makeEmbed(stats: Stats, user: User) {
		const { wins, games, currentStreak, bestStreak, guesses } = stats;

		const sum = guesses.reduce((a, b) => a + b, 0);
		const percentages = guesses.map(g => Math.round((g / sum) * 100));
		percentages.push(110);

		const guessesDistribution = makeStats(percentages);
		const hasStreak = currentStreak > 4 ? ' 🔥' : '';

		return new MessageEmbed()
			.setTitle(user.tag)
			.setThumbnail(user.displayAvatarURL())
			.setColor('#2f3136')
			.setImage(guessesDistribution)
			.addFields([
				{ name: 'Jogos', value: '```' + `${games}` + '```', inline: true },
				{ name: 'Vitórias', value: '```' + `${wins}` + '```', inline: true },
				{ name: '% de vitórias', value: '```' + `${Math.round((wins / games) * 100)}%` + '```', inline: true },
				{ name: 'Sequência de vitórias', value: '```' + `${currentStreak}${hasStreak}` + '```', inline: true },
				{ name: 'Melhor sequência', value: '```' + `${bestStreak}` + '```', inline: true },
			]);
	}
}
