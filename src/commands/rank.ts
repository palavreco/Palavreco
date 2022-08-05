import { CommandInteraction, MessageAttachment, User } from 'discord.js';
import { ApplicationCommandOptionType, RESTPostAPIChatInputApplicationCommandsJSONBody } from 'discord-api-types/v10';
import { Command } from '../interfaces/Command';
import { getAllGuesses } from '../database';
import { createCanvas, loadImage, GlobalFonts } from '@napi-rs/canvas';
import { rankTemplate } from '../utils/assets.json';

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

		interaction.reply({ files: [await this.makeImage(isServer, scores, interaction)] });
	}

	async makeImage(
		isServer: boolean,
		scores: { id: string, points: number }[],
		int: CommandInteraction,
	): Promise<MessageAttachment> {
		const canvas = createCanvas(1200, 900);
		const ctx = canvas.getContext('2d');
		ctx.drawImage(await loadImage(rankTemplate), 0, 0);

		const namePixels = {
			'1': [593, 239], '2': [266, 298], '3': [925, 298],
			'4': [281, 420], '5': [281, 549], '6': [281, 678],
			'7': [770, 420], '8': [770, 549], '9': [770, 678],
			'10': [324, 807], '11': [-30, -30],
		};

		GlobalFonts.registerFromPath('src/utils/inter.ttf', 'inter');
		for (let i = 0; i <= 10; i++) {
			let user: { username: string; discriminator: string, points: number };
			if (scores[i]) {
				const { id, points } = scores[i];

				const obj = (await int.guild!.members.fetch(id)).user;
				const { username, discriminator } = obj;

				user = { username, discriminator, points };
			} else {
				user = { username: '?????', discriminator: '0000', points: 0 };
			}

			const [width, height] = [namePixels[i + 1]['0'], namePixels[i + 1]['1']];

			ctx.font = '27px inter';
			ctx.fillStyle = '#ffffff';
			ctx.textAlign = 'end';
			ctx.fillText(this.normalizeText(user.username), width, height);

			ctx.font = '18px inter';
			ctx.fillStyle = '#b5b5b5';
			ctx.textAlign = 'start';
			ctx.fillText(`#${user.discriminator}`, width + 5, height);

			ctx.font = '22px inter';
			ctx.fillStyle = '#c1c1c1';
			ctx.textAlign = 'center';
			if (i < 3) {
				ctx.fillText(`${user.points} points`, width, height + 30);
			} else {
				if (i !== 9) {
					ctx.fillText(`${user.points} points`, width + 230, height);
				} else {
					ctx.fillText(`${user.points} points`, width + 670, height);
				}
			}
		}

		return new MessageAttachment(await canvas.encode('png'), 'rank.png');
	}

	normalizeText(text: string) {
		if (text.length > 8) return text.slice(0, 8) + '…';
		else return text;
	}
}
