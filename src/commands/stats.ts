import { Command } from '../interfaces/Command';
import { Client, CommandInteraction, MessageEmbed, User } from 'discord.js';
import { ApplicationCommandOptionType, RESTPostAPIChatInputApplicationCommandsJSONBody } from 'discord-api-types/v10';
import QuickChart from 'quickchart-js';
import { getGuesses, getStats } from '../database';
import { Guesses, Stats } from '../interfaces/Database';
import { check } from '../utils/emotes.json';

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
		if (!stats) {
			interaction.reply(`${check.red} **${optionOrUser.tag}** não tem nenhuma estatística!`);
			return;
		}

		interaction.reply({ embeds: [this.makeEmbed(stats, guesses!, client)] });
	}

	makeEmbed(stats: Stats, guesses: Guesses, client: Client) {
		const { id, wins, games, win_percentage, current_streak, best_streak } = stats;
		const { one, two, three, four, five, six, losses } = guesses;
		const user: User = client.users.cache.get(id)!;

		const all = one + two + three + four + five + six + losses;
		const percentages = [];
		for (const key in guesses) {
			if (key !== 'id') {
				// @ts-ignore
				percentages.push(Math.round((guesses[key] / all) * 100));
			}
		}
		percentages.push(100);

		const chart = new QuickChart();
		chart.setConfig({
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
					xAxes: [{ display: false, gridLines: { display: false } }],
					yAxes: [{ gridLines: { display: false } }],
				},
				plugins: {
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

		return new MessageEmbed()
			.setTitle(user.tag)
			.setThumbnail(user.displayAvatarURL())
			.setColor('#2f3136')
			.addFields([
				{ name: 'Jogos', value: '```' + games.toString() + '```', inline: true },
				{ name: 'Vitórias', value: '```' + wins.toString() + '```', inline: true },
				{ name: 'Percentual de vitórias', value: '```' + win_percentage.toString() + '% ```', inline: true },
				{ name: 'Sequência de vitórias', value: '```' + current_streak.toString() + '```', inline: true },
				{ name: 'Melhor sequência', value: '```' + best_streak.toString() + '```', inline: true },
			])
			.setImage(chart.getUrl());
	}
}
