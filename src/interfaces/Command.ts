import { CommandInteraction } from 'discord.js';
import { APIApplicationCommandOption } from 'discord-api-types';

export interface Command {
	name: string;
	description: string;
    dev: boolean;
	subCommands?: APIApplicationCommandOption[];
	execute(interaction: CommandInteraction): void;
}
