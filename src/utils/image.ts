import {
	createCanvas,
	GlobalFonts,
	loadImage,
	SKRSContext2D,
} from '@napi-rs/canvas';
import { CommandInteraction, MessageAttachment } from 'discord.js';
import QuickChart from 'quickchart-js';
import { getUser } from '../database';
import { rankTemplate } from '../dunno/assets.json';

GlobalFonts.registerFromPath('src/utils/inter.ttf', 'inter');

const numberPixels = {
	'3': [77, 438],
	'4': [462, 438],
	'5': [847, 438],
	'6': [77, 552],
	'7': [462, 552],
	'8': [847, 552],
	'9': [439, 671],
};
const namePixels = {
	'0': [620, 253],
	'1': [295, 305],
	'2': [945, 305],
	'3': [126, 427],
	'4': [511, 427],
	'5': [896, 427],
	'6': [126, 541],
	'7': [511, 541],
	'8': [896, 541],
	'9': [516, 659],
};

export async function makeRank(
	isServer: boolean,
	scores: ({ id: string; points: number } | undefined)[],
	int: CommandInteraction,
): Promise<MessageAttachment> {
	const canvas = createCanvas(1240, 750);
	const ctx = canvas.getContext('2d');
	ctx.drawImage(await loadImage(rankTemplate), 0, 0);

	newStyle(ctx, { font: '28px inter', fill: '#111111', align: 'start' });
	if (isServer) {
		const icon = int.guild!.iconURL({ size: 64 });
		if (icon) {
			const imgCanvas = createCanvas(64, 64);
			const imgCtx = imgCanvas.getContext('2d');

			imgCtx.save();
			roundedImage(imgCtx, 0, 0, 64, 64, 15);
			imgCtx.fillStyle = '#3d6b4a';
			imgCtx.fill();
			imgCtx.clip();
			imgCtx.drawImage(await loadImage(icon), 0, 0, 64, 64);
			imgCtx.restore();

			ctx.drawImage(imgCanvas, 17, 17);
		}

		ctx.fillText(normalizeText(int.guild!.name.toUpperCase(), 'title'), 90, 48);
	} else {
		ctx.fillText('RANK GLOBAL', 90, 48);
	}

	// @ts-ignore
	const userPosition = scores.findIndex((s) => s.id === int.user.id) + 1 ?? '';
	if (userPosition) {
		newStyle(ctx, { font: '18px inter', fill: '#373737', align: 'start' });
		ctx.fillText(`Sua posição: ${userPosition} de ${scores.length}`, 90, 73);
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
		let user: {
			username: string;
			discriminator: string;
			points: number;
			games: number;
		};
		if (scores[i]) {
			const { id, points } = scores[i]!;
			const obj = await int.client.users.fetch(id);
			const u = await getUser(id);

			user = {
				username: obj.username,
				discriminator: obj.discriminator,
				points,
				games: u!.gameswinsrank[0],
			};
		} else {
			break;
		}

		// @ts-ignore
		const [width, height] = [namePixels[i][0], namePixels[i][1]];
		const { username, discriminator, points, games } = user;

		if (i < 3) {
			newStyle(ctx, { font: '18px inter', fill: '#232322', align: 'start' });
			const dWidth = ctx.measureText(`#${discriminator}`).width;

			newStyle(ctx, { font: '27px inter', fill: '#111111', align: 'center' });
			ctx.fillText(
				normalizeText(username, 'small'),
				width - dWidth / 2,
				height,
			);
			const nWidth = ctx.measureText(normalizeText(username, 'small')).width;

			newStyle(ctx, { font: '18px inter', fill: '#232322', align: 'center' });
			ctx.fillText(`#${discriminator}`, width + nWidth / 2 + 5, height);

			newStyle(ctx, { font: '22px inter', fill: '#313131', align: 'center' });
			ctx.fillText(`${points} pontos • ${games} jogos`, width, height + 30);
		} else {
			const name =
				i != 9
					? normalizeText(username, 'small')
					: normalizeText(username, 'big');

			newStyle(ctx, { font: '20px inter', fill: '#ffffff', align: 'start' });
			ctx.fillText(name, width, height);
			const tWidth = ctx.measureText(name).width;

			newStyle(ctx, { font: '15px inter', fill: '#b5b5b5', align: 'start' });
			ctx.fillText(`#${discriminator}`, width + tWidth + 5, height);

			newStyle(ctx, { font: '22px inter', fill: '#c1c1c1', align: 'center' });
			ctx.fillText(
				`${points} • ${games}`,
				i != 9 ? width + 230 : width + 250,
				height,
			);
		}
	}

	return new MessageAttachment(await canvas.encode('png'), 'rank.png');
}

function newStyle(
	ctx: SKRSContext2D,
	{ font, fill, align }: Record<string, string>,
) {
	ctx.font = font;
	ctx.fillStyle = fill;

	// @ts-ignore
	ctx.textAlign = align;
}

function normalizeText(text: string, type: 'small' | 'big' | 'title') {
	if (type === 'small') {
		if (text.length > 9) return text.slice(0, 8) + '…';
		else return text;
	} else if (type === 'big') {
		if (text.length > 12) return text.slice(0, 11) + '…';
		else return text;
	} else {
		if (text.length > 20) return text.slice(0, 19) + '…';
		else return text;
	}
}

function roundedImage(
	ctx: SKRSContext2D,
	x: number,
	y: number,
	width: number,
	height: number,
	radius: number,
) {
	ctx.beginPath();
	ctx.moveTo(x + radius, y);

	ctx.lineTo(x + width - radius, y);
	ctx.quadraticCurveTo(x + width, y, x + width, y + radius);

	ctx.lineTo(x + width, y + height - radius);
	ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);

	ctx.lineTo(x + radius, y + height);
	ctx.quadraticCurveTo(x, y + height, x, y + height - radius);

	ctx.lineTo(x, y + radius);
	ctx.quadraticCurveTo(x, y, x + radius, y);

	ctx.closePath();
}

export function makeStats(data: number[]): string {
	const chart = new QuickChart();
	chart.setConfig({
		// @ts-ignore
		type: 'horizontalBar',
		data: {
			labels: ['1️', '2️', '3', '4', '5', '6', '❌'],
			datasets: [
				{
					data,
					borderWidth: 2,
					borderRadius: 3,
					backgroundColor: 'rgba(46, 209, 85, 0.5)',
					borderColor: 'rgb(38, 173, 70)',
				},
			],
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
				datalabels: {
					align: 'end',
					anchor: 'end',
					color: '#111',
					borderWidth: 2,
					borderRadius: 5,
					backgroundColor: 'rgba(222, 222, 222, 0.6)',
					borderColor: 'rgba(196, 196, 196, 1)',
					formatter: (value: string) => value + '%',
				},
			},
		},
	});

	return chart.getUrl();
}
