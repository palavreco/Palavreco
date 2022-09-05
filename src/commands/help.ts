import {
	CommandInteraction,
	MessageActionRow,
	MessageButton,
} from 'discord.js';
import { RESTPostAPIChatInputApplicationCommandsJSONBody } from 'discord-api-types/v10';
import { Command } from '../interfaces/Command';
import { t } from '../utils/replyHelper';

export default class Help implements Command {
	commandStructure: RESTPostAPIChatInputApplicationCommandsJSONBody = {
		name: 'ajuda',
		description: 'Mostra como o jogo funciona',
	};

	dev = false;

	execute(interaction: CommandInteraction) {
		const row = new MessageActionRow().addComponents([
			new MessageButton()
				.setCustomId('help_game')
				.setEmoji('1008463018495066232')
				.setLabel('Jogo')
				.setStyle('PRIMARY'),
			new MessageButton()
				.setCustomId('help_rank')
				.setEmoji('1008463019484909570')
				.setLabel('Rank')
				.setStyle('PRIMARY'),
		]);

		interaction.reply({
			content: t('help'),
			components: [row],
			ephemeral: true,
		});
	}
}
