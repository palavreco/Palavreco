import fs from 'node:fs';
import dotenv from 'dotenv';
import { Client, Collection } from 'discord.js';
import { Command } from './interfaces/Command';
dotenv.config();

const client = new Client({ intents: ['GUILDS', 'GUILD_MESSAGES'] });

const botCmds = new Collection();
const cmdsFolder = fs.readdirSync('./src/commands');

for (const file of cmdsFolder) {
	const name = file.split('.')[0];
	const cmd = import(`./commands/${name}.js`);

	cmd.then(command => {
		const cmdInstance: Command = new command.default();
		botCmds.set(cmdInstance.name, cmdInstance);
	});
}

client.on('interactionCreate', i => {
	if (!i.isCommand()) return;

	const command = botCmds.get(i.commandName) as Command;
	command.execute(i);
});

client.login(process.env.TOKEN);
