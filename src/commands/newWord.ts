import { CommandInteraction } from 'discord.js';
import { Command, CommandData } from '../interfaces';
import { newWord } from '../database';

export default class NewWord implements Command {
	commandStructure: CommandData = {
		name: 'neword',
		description: 'Change the day word',
	};

	dev = true;

	execute(interaction: CommandInteraction) {
		newWord(true);
		interaction.reply('✅ Day word changed!');
	}
}
