import { Command } from '../interfaces/Command';
import { Client, CommandInteraction, MessageEmbed, User } from 'discord.js';
import { ApplicationCommandOptionType, RESTPostAPIChatInputApplicationCommandsJSONBody } from 'discord-api-types/v10';
import QuickChart from 'quickchart-js';
import { getGuesses, getStats } from '../database';
import { Guesses, Stats } from '../interfaces/Database';
import { check } from '../utils/assets.json';

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
		const { options, user, client } = interaction;
		const option = options.getUser('user');

		const optionOrUser = option ? option : user;
		const stats = await getStats(optionOrUser.id);
		const guesses = await getGuesses(optionOrUser.id);
		if (!stats || !guesses) {
			interaction.reply(`${check.red} **${optionOrUser.tag}** não tem nenhuma estatística!`);
			return;
		}

		interaction.reply({ embeds: [this.makeEmbed(stats, guesses, client)] });
	}

	makeEmbed(stats: Stats, guesses: Guesses, client: Client) {
		const { id, wins, games, win_percentage, current_streak, best_streak } = stats;
		const { one, two, three, four, five, six, losses } = guesses;
		const user: User = client.users.cache.get(id)!;

		const all = one + two + three + four + five + six + losses;
		const percentages = [];
		for (const key in guesses) {
			if (key !== 'id' && key !== 'guilds') {
				// @ts-ignore
				percentages.push(Math.round((guesses[key] / all) * 100));
			}
		}
		percentages.push(110);

		const chart = new QuickChart();
		// all ts-ignore's here are safe to use, will check latter if we can get rid of them
		chart.setConfig({
			// @ts-ignore
			type: 'horizontalBar',
			data: {
				labels: ['1️', '2️', '3', '4', '5', '6', '❌'],
				datasets: [{ data: percentages, borderWidth: 2, borderRadius: 3,
					backgroundColor: 'rgba(46, 209, 85, 0.5)',
					borderColor: 'rgb(38, 173, 70)',
				}],
			},
			options: {
				legend: { display: false },
				title: { display: true, text: 'DISTRIBUIÇÃO DE TENTATIVAS' },
				scales: {
					// @ts-ignore
					xAxes: [{ display: false, gridLines: { display: false } }],
					// @ts-ignore
					yAxes: [{ gridLines: { display: false } }],
				},
				plugins: {
					// @ts-ignore
					datalabels: { align: 'end', anchor: 'end', color: '#111', borderWidth: 2, borderRadius: 5,
						backgroundColor: 'rgba(222, 222, 222, 0.6)',
						borderColor: 'rgba(196, 196, 196, 1)',
						formatter: (value: string) => {
							return value + '%';
						},
					},
				},
			},
		});

		const hasStreak = current_streak > 4 ? ' 🔥' : '';

		return new MessageEmbed()
			.setTitle(user.tag)
			.setThumbnail(user.displayAvatarURL())
			.setColor('#2f3136')
			.addFields([
				{ name: 'Jogos', value: '```' + `${games}` + '```', inline: true },
				{ name: 'Vitórias', value: '```' + `${wins}` + '```', inline: true },
				{ name: '% de vitórias', value: '```' + `${win_percentage}%` + '```', inline: true },
				{ name: 'Sequência de vitórias', value: '```' + `${current_streak}${hasStreak}` + '```', inline: true },
				{ name: 'Melhor sequência', value: '```' + `${best_streak}` + '```', inline: true },
			])
			.setImage(chart.getUrl());
	}
}
