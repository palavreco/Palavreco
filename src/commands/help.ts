import { CommandInteraction } from 'discord.js';
import { RESTPostAPIChatInputApplicationCommandsJSONBody } from 'discord-api-types/v10';
import { Command } from '../interfaces/Command';
import { letter } from '../utils/emotes.json';
import { share } from '../utils/shareReply';

export default class Help implements Command {
	commandStructure: RESTPostAPIChatInputApplicationCommandsJSONBody = {
		'name': 'ajuda',
		'description': 'Mostra como o jogo funciona',
	};

	dev = false;

	execute(interaction: CommandInteraction) {
		interaction.reply(share('help', {
			e: letter.green.e,
			i: letter.yellow.i,
			v: letter.gray.v,
		}));
	}
}
