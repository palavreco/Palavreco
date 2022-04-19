import { CommandInteraction } from 'discord.js';
import { RESTPostAPIChatInputApplicationCommandsJSONBody } from 'discord-api-types/v10';

export interface Command {
	commandStrucure: RESTPostAPIChatInputApplicationCommandsJSONBody;
	dev: boolean;
	execute(interaction: CommandInteraction): void;
}
