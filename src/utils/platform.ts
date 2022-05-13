import { CommandInteraction, MessageComponentInteraction } from 'discord.js';

export async function platform(interaction: CommandInteraction) {
	const filter = (button: MessageComponentInteraction) => button.user.id === interaction.user.id;

	return interaction.channel!.awaitMessageComponent({ filter }).then(int => {
		return int.customId;
	});
}
