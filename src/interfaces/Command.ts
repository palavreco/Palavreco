import { CommandInteraction, PermissionString } from 'discord.js';
import { ApplicationCommandOptionType, RESTPostAPIChatInputApplicationCommandsJSONBody } from 'discord-api-types/v10';

export interface Command {
	commandStructure: CommandData;
	dev: boolean;
	permissions?: PermissionString[];
	execute(interaction: CommandInteraction): void;
}

export type CommandData = RESTPostAPIChatInputApplicationCommandsJSONBody;

export const OptionType = ApplicationCommandOptionType;
