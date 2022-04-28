import { CommandInteraction } from 'discord.js';
import { ApplicationCommandOptionType, RESTPostAPIChatInputApplicationCommandsJSONBody } from 'discord-api-types/v10';
import { Command } from '../interfaces/Command';
import { check } from '../utils/emotes.json';
import { resetUser } from '../database';
import { share } from '../utils/shareReply';

export default class Reset implements Command {
	commandStructure: RESTPostAPIChatInputApplicationCommandsJSONBody = {
		'name': 'reset',
		'description': 'Seta o status do usuário para false, ou seja, ele pode jogar novamente',
		'options': [
			{
				'name': 'user',
				'description': 'Usuário que será resetado',
				'required': true,
				'type': ApplicationCommandOptionType.User,
			},
		],
	};

	dev = true;

	async execute(interaction: CommandInteraction) {
		const user = interaction.options.getUser('user');

		if (await resetUser(user!.id)) {
			interaction.reply(share('user_reseted', {
				greenTick: check.green,
				user: user!,
			}));
		} else {
			interaction.reply(share('user_already_reseted', {
				redTick: check.red,
				user: user!,
			}));
		}
	}
}