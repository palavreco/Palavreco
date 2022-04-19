import fs from 'node:fs';
import fetch from 'node-fetch';
import dotenv from 'dotenv';
import { Command } from './interfaces/Command';
dotenv.config();

const { CLIENT_ID, GUILD_ID, TOKEN } = process.env;

fs.readdirSync('./src/commands').forEach(file => {
	const name = file.split('.')[0];
	const commandImport = import(`./commands/${name}.js`);

	commandImport.then(command => {
		const cmdInstance: Command = new command.default();
		const { commandStrucure, dev } = cmdInstance;

		fetch(`https://discord.com/api/v10/applications/${CLIENT_ID}${dev ? '' : `/guilds/${GUILD_ID}`}/commands`, {
			method: 'POST',
			headers: {
				Authorization: `Bot ${TOKEN}`,
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(commandStrucure),
		}).then(res => console.log(res));
	});
});
