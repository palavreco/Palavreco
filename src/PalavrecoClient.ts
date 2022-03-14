// import fs from 'fs';
// import path from 'path';
import { Client, ClientOptions, Collection } from 'discord.js';
import { PalavrecoCommand } from './structures/BaseCommand';
import { PalavrecoSettings, PalavrecoFundamentals } from './structures/ClientSettings';
import { PalavrecoConfig } from './utils/PalavrecoConfig';

export default class PalavrecoClient extends Client {
	public commands = new Collection<string, PalavrecoCommand>();
	public config: PalavrecoSettings;

	constructor(options: ClientOptions) {
		super(options);

		this.config = PalavrecoConfig;
	}

	public start(options: PalavrecoFundamentals): void {
		// this.loadCommands();
		void super.login(options.token);
	}

	// TODO: Add a way to load commands from commands folder
	// private loadCommands(): void {
	//	const commandsPath = path.join(__dirname, 'commands');
	//
	//	fs.readdirSync(commandsPath).forEach(file => {
	//		const command = require(`${commandsPath}/${file}`).default;
	//		this.commands.set(command.name, command);
	//	})
	// }
}
