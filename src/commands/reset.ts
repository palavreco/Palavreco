import { CommandInteraction } from 'discord.js';
import { Command, CommandData, OptionType } from '../interfaces';
import { resetUser } from '../database';

export default class Reset implements Command {
	commandStructure: CommandData = {
		name: 'reset',
		description: 'Set the user status to false, i.e. the user can play again',
		options: [
			{
				name: 'user',
				description: 'The user to reset',
				required: true,
				type: OptionType.User,
			},
		],
	};

	dev = true;

	async execute(interaction: CommandInteraction) {
		const user = interaction.options.getUser('user');

		switch (await resetUser(user!.id)) {
			case 'dont_exist':
				interaction.reply(
					`❌ **${user!.tag}** (\`${user!.id}\`) doesn't exist in the database`,
				);
				break;
			case 'reseted':
				interaction.reply(
					`✅ **${user!.tag}** (\`${user!.id}\`) has been reseted`,
				);
				break;
			case 'already_reseted':
				interaction.reply(
					`❌ **${user!.tag}** (\`${user!.id}\`) is already reseted`,
				);
		}
	}
}
