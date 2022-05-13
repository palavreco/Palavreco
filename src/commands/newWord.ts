import { CommandInteraction } from 'discord.js';
import { RESTPostAPIChatInputApplicationCommandsJSONBody } from 'discord-api-types/v10';
import { Command } from '../interfaces/Command';
import { newWord } from '../database';
import { check } from '../utils/emotes.json';

export default class NewWord implements Command {
	commandStructure: RESTPostAPIChatInputApplicationCommandsJSONBody = {
		'name': 'neword',
		'description': 'Change the day word',
	};

	dev = true;

	execute(interaction: CommandInteraction) {
		newWord(true);
		interaction.reply(`${check.green} Day word changed!`);
	}
}