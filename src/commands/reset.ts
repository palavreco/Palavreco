import { CommandInteraction } from 'discord.js';
import { ApplicationCommandOptionType, RESTPostAPIChatInputApplicationCommandsJSONBody } from 'discord-api-types/v10';
import { Command } from '../interfaces/Command';
import { resetUser } from '../database';
import { check } from '../utils/emotes.json';

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

		if (await resetUser(user!.id)) {
			interaction.reply(`${check.green} **${user!.tag}** (${user!.id}) resetado!`);
		} else {
			interaction.reply(`${check.red} **${user!.tag}** (${user!.id}) já foi resetado!`);
		}
	}
}