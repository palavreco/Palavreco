import fs from 'node:fs';
import dotenv from 'dotenv';
import { Client, Collection, Guild } from 'discord.js';
import { Command } from './interfaces/Command';
import { verifyWord, newWord, setUp, resetRank } from './database';
import { getMissingPermissions } from './utils/permissions';
import { runAtEndOf } from './utils/runner';
import { log } from './utils/log';
import { t } from './utils/replyHelper';
import { setUpPresence } from './utils/presence';
import { notifyLogChannel } from './utils/guildLog';
import { letter } from './utils/assets.json';
dotenv.config();

const client = new Client({ intents: ['GUILDS', 'GUILD_MESSAGES', 'GUILD_MESSAGE_REACTIONS'] });

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

	cmd.then(command => {
		const cmdInstance: Command = new command.default();
		botCmds.set(cmdInstance.commandStructure.name, cmdInstance);
	});
}

client.on('interactionCreate', i => {
	if (i.isCommand()) {
		const command = botCmds.get(i.commandName);

		if (command) {
			const missingPermissions = getMissingPermissions(command.permissions, i);

			if (missingPermissions) {
				i.reply(t('missing_permissions', {
					perms: missingPermissions.join(' '),
				}));

				return;
			}

			command.execute(i);
		}
	} else if (i.isButton()) {
		if (i.customId === 'help_game') {
			i.reply({
				content: t('help_game', { e: letter.green.e, i: letter.yellow.i, v: letter.gray.v }),
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

runAtEndOf('month', () => {
	resetRank();
});
