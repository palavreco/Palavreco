import { CommandInteraction, PermissionString } from 'discord.js';
import { RESTPostAPIChatInputApplicationCommandsJSONBody } from 'discord-api-types/v10';

export interface Command {
	commandStructure: RESTPostAPIChatInputApplicationCommandsJSONBody;
	dev: boolean;
	permissions?: PermissionString[];
	execute(interaction: CommandInteraction): void;
}
