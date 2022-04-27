import { CommandInteraction } from 'discord.js';
import { RESTPostAPIChatInputApplicationCommandsJSONBody } from 'discord-api-types/v10';
import { Command } from '../interfaces/Command';
import { newDay } from '../database';
import { check } from '../utils/emotes.json';

export default class NewWord implements Command {
	commandStructure: RESTPostAPIChatInputApplicationCommandsJSONBody = {
		'name': 'neword',
		'description': 'Muda a palavra do dia',
	};

	dev = true;

	execute(interaction: CommandInteraction) {
		newDay(true);
		interaction.reply(`${check.green} Palavra do dia alterada com sucesso!`);
	}
}