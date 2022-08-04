import { CommandInteraction, MessageAttachment } from 'discord.js';
import { ApplicationCommandOptionType, RESTPostAPIChatInputApplicationCommandsJSONBody } from 'discord-api-types/v10';
import { Command } from '../interfaces/Command';
import { getAllGuesses } from '../database';
import { createCanvas, loadImage, GlobalFonts } from '@napi-rs/canvas';
import { rankTemplate } from '../utils/assets.json';

export default class Rank implements Command {
	commandStructure: RESTPostAPIChatInputApplicationCommandsJSONBody = {
		name: 'rank',
		description: 'Mostra o rank dos usuários',
		options: [{
			name: 'server',
			description: 'Mostra o rank do servidor',
			type: ApplicationCommandOptionType.Subcommand,
		}, {
			name: 'global',
			description: 'Mostra o rank global',
			type: ApplicationCommandOptionType.Subcommand,
		}],
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
		const { height, width } = canvas;
		const wid = width / 10;
		const hei = height / 10;
		const ctx = canvas.getContext('2d');

		const background = await loadImage(rankTemplate);
		ctx.drawImage(background, 0, 0);

		GlobalFonts.registerFromPath('src/utils/inter.ttf', 'inter');
		for (let i = 0; i < 3; i++) {
			const { id, points } = scores[i];
			const user = (await int.guild!.members.fetch(id)).user;

			ctx.font = '27px inter';
			ctx.fillStyle = '#ffffff';
			if (i === 0) ctx.fillText(user.username, wid * 4 + 50, hei * 3 - 20);
			else if (i === 1) ctx.fillText(user.username, wid + 50, hei * 3 + 25);
			else if (i === 2) ctx.fillText(user.username, wid * 7 + 15, hei * 3 + 25);

			ctx.font = '17.25px inter';
			ctx.fillStyle = '#b5b5b5';
			if (i === 0) ctx.fillText(`#${user.discriminator}`, wid * 5, hei * 3 - 20);
			else if (i === 1) ctx.fillText(`#${user.discriminator}`, wid * 3 - 75, hei * 3 + 25);
			else if (i === 2) ctx.fillText(`#${user.discriminator}`, wid * 8 - 25, hei * 3 + 25);
		}


		return new MessageAttachment(await canvas.encode('png'), 'rank.png');
	}
}
