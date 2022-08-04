import { CommandInteraction } from 'discord.js';
import { RESTPostAPIChatInputApplicationCommandsJSONBody } from 'discord-api-types/v10';
import { Command } from '../interfaces/Command';
import { t } from '../utils/replyHelper';
import { letter } from '../utils/assets.json';

export default class Help implements Command {
	commandStructure: RESTPostAPIChatInputApplicationCommandsJSONBody = {
		'name': 'ajuda',
		'description': 'Mostra como o jogo funciona',
	};

	dev = false;

	execute(interaction: CommandInteraction) {
		interaction.reply(t('help', {
			e: letter.green.e,
			i: letter.yellow.i,
			v: letter.gray.v,
		}));
	}
}
