import fs from 'fs';
import path from 'path';
import { Client, ClientOptions, Collection } from 'discord.js';
import { PalavrecoCommands } from './scructures/BaseCommand';
import { PalavrecoSettings, PalavrecoFundamentals } from './scructures/ClientSettings';
import { PalavrecoConfig } from './utils/PalavrecoConfig';

export default class PalavrecoClient extends Client {
    public commands = new Collection<string, PalavrecoCommands>();
    public config: PalavrecoSettings;

    constructor(options: ClientOptions) {
        super(options);

        this.commands = new Collection();
        this.config = PalavrecoConfig;
    }

    public start(options: PalavrecoFundamentals): void {
        this.loadCommands();
        super.login(options.token);
    }

    private loadCommands(): void {
        const commandsPath = path.join(__dirname, 'commands');
        
        fs.readdirSync(commandsPath).forEach(file => {
            const command = require(`${commandsPath}/${file}`).default;
            this.commands.set(command.name, command);
        })
    }
}
