import fs from 'node:fs';
import dotenv from 'dotenv';
import { Client, Collection, Guild } from 'discord.js';
import { Command } from './interfaces/Command';
import { verifyWord, newWord, setUp, setNewGuild } from './database';
import { checkPermissions, runAtEndOf, log, t, setUpPresence, notifyLogChannel } from './utils';
import { letter } from './dunno/assets.json';

dotenv.config();

const client = new Client({
	intents: ['GUILDS', 'GUILD_MESSAGES', 'GUILD_MESSAGE_REACTIONS'],
});

client.once('ready', () => {
	log('Client is ready', 'BOT', 'green');

	setUpPresence(client);
});

client.on('guildCreate', (guild: Guild) => {
	notifyLogChannel('join', guild, client);

	log(`Joined ${guild.name} (${guild.id})`, 'BOT', 'blue');
});

client.on('guildDelete', (guild: Guild) => {
	notifyLogChannel('leave', guild, client);

	log(`Left ${guild.name} (${guild.id})`, 'BOT', 'red');
});

const botCmds: Collection<string, Command> = new Collection();
const cmdsFolder = fs.readdirSync('./src/commands');

for (const file of cmdsFolder) {
	const name = file.split('.')[0];
	const cmd = import(`./commands/${name}`);

	cmd.then((command) => {
		const cmdInstance: Command = new command.default();
		botCmds.set(cmdInstance.commandStructure.name, cmdInstance);
	});
}

client.on('interactionCreate', async (i) => {
	if (i.isCommand()) {
		const command = botCmds.get(i.commandName);

		if (command) {
			if (i.guild) {
				await setNewGuild(i.user.id, i.guild.id);

				const missingPermissions = checkPermissions(command.permissions, i.guild);

				if (missingPermissions) {
					i.reply(
						t('missing_permissions', {
							perms: missingPermissions.join(' '),
						}),
					);

					return;
				}

				command.execute(i);
			} else {
				command.execute(i);
			}
		}
	} else if (i.isButton()) {
		if (i.customId === 'help_game') {
			i.reply({
				content: t('help_game', {
					e: letter.green.e,
					i: letter.yellow.i,
					v: letter.gray.v,
				}),
				ephemeral: true,
			});
		} else if (i.customId === 'help_rank') {
			i.reply({ content: t('help_rank'), ephemeral: true });
		}
	} else {
		return;
	}
});

client.login(process.env.TOKEN);
setUp();
verifyWord();

runAtEndOf('day', () => {
	newWord();
	log('New word & users reseted!', 'DB', 'purple');
});

// runAtEndOf('month', () => {
// 	resetRank();
// });
