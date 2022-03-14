import { Collection } from 'discord.js';
import { PalavrecoCommand } from '../structures/BaseCommand';

import { PalavrecoFundamentals, PalavrecoSettings } from '../structures/ClientSettings';
export const PalavrecoConfig: PalavrecoSettings = {
	developers: [
		'392099429768888351', '535549399938367528',
		'762079458249146388',
	],
	embedColor: '#2596be',
	intents: ['GUILDS', 'GUILD_MESSAGES'],
	defaultPermissions: [
		'SEND_MESSAGES', 'MANAGE_MESSAGES',
		'USE_EXTERNAL_EMOJIS', 'VIEW_CHANNEL',
	],
	activities: [
		{ name: '/adivinhar', type: 'PLAYING' },
		{ name: 'suas tentativas...', type: 'WATCHING' },
	],
	supportServer: 'https://discord.gg/KEdytHNbK2',
	// eslint-disable-next-line max-len
	botInvite: 'https://discord.com/oauth2/authorize?client_id=935291567038672906&permissions=273408&scope=bot%20applications.commands',
};

export const PalavrecoOptions: PalavrecoFundamentals = {
	commands: new Collection<string, PalavrecoCommand>(),
	// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
	token: process.env.TOKEN!,
};
