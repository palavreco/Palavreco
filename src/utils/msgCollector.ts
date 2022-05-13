import { CommandInteraction, Message } from 'discord.js';

export function awaitMessage(interaction: CommandInteraction) {
	const filter = (msg: Message) => interaction.user.id === msg.author.id;

	const sendedMessage = interaction.channel!.awaitMessages({ max: 1, filter }).then(msg => {
		return {
			content: msg.first()?.content.toLocaleLowerCase().trim() ?? '',
			message: msg.first(),
		};
	});

	return sendedMessage;
}
