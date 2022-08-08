import { createCanvas, GlobalFonts, loadImage, SKRSContext2D } from '@napi-rs/canvas';
import { CommandInteraction, MessageAttachment } from 'discord.js';
import { rankTemplate } from '../utils/assets.json';

GlobalFonts.registerFromPath('src/utils/inter.ttf', 'inter');

const numberPixels = {
	'3': [77, 438], '4': [462, 438],
	'5': [847, 438], '6': [77, 552],
	'7': [462, 552], '8': [847, 552],
	'9': [439, 671],
};
const namePixels = {
	'0': [620, 253], '1': [295, 305],
	'2': [945, 305], '3': [126, 427],
	'4': [511, 427], '5': [896, 427],
	'6': [126, 541], '7': [511, 541],
	'8': [896, 541], '9': [511, 827],
};

export async function makeImage(
	isServer: boolean,
	scores: { id: string, points: number }[],
	int: CommandInteraction,
): Promise<MessageAttachment> {
	const canvas = createCanvas(1240, 750);
	const ctx = canvas.getContext('2d');
	ctx.drawImage(await loadImage(rankTemplate), 0, 0);

	newStyle(ctx, { font: '28px inter', fill: '#ffffff', align: 'start' });
	isServer ? ctx.fillText(int.guild?.name.toUpperCase(), 30, 55) : ctx.fillText('RANK GLOBAL', 30, 55);

	const userPosition = scores.findIndex(s => s.id === int.user.id) + 1 ?? '';
	if (userPosition) {
		newStyle(ctx, { font: '18px inter', fill: '#c1c1c1', align: 'start' });
		ctx.fillText(`Sua posição: ${userPosition}`, 30, 83);
	}

	for (let j = 0; j < scores.length; j++) {
		if (j > 9) break;

		if (j > 2) {
			newStyle(ctx, { font: '53px inter', fill: '#ffffff', align: 'start' });
			// @ts-ignore
			ctx.fillText(`${j + 1}`, numberPixels[j][0], numberPixels[j][1]);
		}
	}

	for (let i = 0; i < 10; i++) {
		let user: { username: string; discriminator: string, points: number };
		if (scores[i]) {
			const { id, points } = scores[i];
			const obj = await int.client.users.fetch(id);
			const { username, discriminator } = obj;
			user = { username, discriminator, points };
		} else {
			break;
		}

		// @ts-ignore
		const [width, height] = [namePixels[i][0], namePixels[i][1]];
		const { username, discriminator, points } = user;

		if (i < 3) {
			newStyle(ctx, { font: '18px inter', fill: '#b5b5b5', align: 'start' });
			const dWidth = ctx.measureText(`#${discriminator}`).width;

			newStyle(ctx, { font: '27px inter', fill: '#ffffff', align: 'center' });
			ctx.fillText(normalizeText(username), width - (dWidth / 2), height);
			const nWidth = ctx.measureText(normalizeText(username)).width;

			newStyle(ctx, { font: '18px inter', fill: '#b5b5b5', align: 'center' });
			ctx.fillText(`#${discriminator}`, width + (nWidth / 2) + 5, height);

			newStyle(ctx, { font: '22px inter', fill: '#c1c1c1', align: 'center' });
			ctx.fillText(`${points} pontos`, width, height + 30);
		} else {
			newStyle(ctx, { font: '20px inter', fill: '#ffffff', align: 'start' });
			ctx.fillText(normalizeText(username), width, height);
			const tWidth = ctx.measureText(normalizeText(username)).width;

			newStyle(ctx, { font: '15px inter', fill: '#b5b5b5', align: 'start' });
			ctx.fillText(`#${discriminator}`, width + tWidth + 5, height);

			newStyle(ctx, { font: '22px inter', fill: '#c1c1c1', align: 'center' });
			ctx.fillText(`${points}`, width + 250, height);
		}
	}

	return new MessageAttachment(await canvas.encode('png'), 'rank.png');
}

function newStyle(ctx: SKRSContext2D, { font, fill, align }: Record<string, string>) {
	ctx.font = font;
	ctx.fillStyle = fill;
	ctx.textAlign = align;
}

function normalizeText(text: string) {
	if (text.length > 10) return text.slice(0, 9) + '…';
	else return text;
}