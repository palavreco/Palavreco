import { CommandInteraction } from 'discord.js';

export interface Command {
	name: string;
	description: string;
    dev?: boolean;
	execute: (interaction: CommandInteraction) => void;
}
