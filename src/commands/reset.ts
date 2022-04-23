import { CommandInteraction } from 'discord.js';
import { ApplicationCommandOptionType, RESTPostAPIChatInputApplicationCommandsJSONBody } from 'discord-api-types/v10';
import { Command } from '../interfaces/Command';
import { check } from '../utils/emotes.json';
import { resetUser } from '../database';

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
		const { id, tag } = user!;

		if (await resetUser(id)) {
			interaction.reply(`${check.green} **${tag}** (\`${id}\`) foi resetado!`);
		} else {
			interaction.reply(`${check.red} **${tag}** (\`${id}\`) já está resetado!`);
		}
	}
}