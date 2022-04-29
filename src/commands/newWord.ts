import { CommandInteraction } from 'discord.js';
import { RESTPostAPIChatInputApplicationCommandsJSONBody } from 'discord-api-types/v10';
import { Command } from '../interfaces/Command';
import { newWord } from '../database';
import { check } from '../utils/emotes.json';
import { t } from '../utils/replyHelper';

export default class NewWord implements Command {
	commandStructure: RESTPostAPIChatInputApplicationCommandsJSONBody = {
		'name': 'neword',
		'description': 'Muda a palavra do dia',
	};

	dev = true;

	execute(interaction: CommandInteraction) {
		newWord(true);
		interaction.reply(t('word_changed', {
			greenTick: check.green,
		}));
	}
}