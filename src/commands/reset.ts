import { CommandInteraction } from 'discord.js';
import { ApplicationCommandOptionType, RESTPostAPIChatInputApplicationCommandsJSONBody } from 'discord-api-types/v10';
import { Command } from '../interfaces/Command';
import { resetUser } from '../database';
import { check } from '../utils/assets.json';

export default class Reset implements Command {
	commandStructure: RESTPostAPIChatInputApplicationCommandsJSONBody = {
		'name': 'reset',
		'description': 'Set the user status to false, i.e. the user can play again',
		'options': [
			{
				'name': 'user',
				'description': 'The user to reset',
				'required': true,
				'type': ApplicationCommandOptionType.User,
			},
		],
	};

	dev = true;

	async execute(interaction: CommandInteraction) {
		const user = interaction.options.getUser('user');

		switch (await resetUser(user!.id)) {
		case 'dont_exist':
			interaction.reply(`${check.red} **${user!.tag}** (\`${user!.id}\`) doesn't exist in the database`);
			break;
		case 'reseted':
			interaction.reply(`${check.green} **${user!.tag}** (\`${user!.id}\`) has been reseted`);
			break;
		case 'already_reseted':
			interaction.reply(`${check.red} **${user!.tag}** (\`${user!.id}\`) is already reseted`);
		}
	}
}