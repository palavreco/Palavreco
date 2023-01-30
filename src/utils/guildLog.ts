import { Client, Guild, MessageEmbed, TextChannel } from 'discord.js';

export async function notifyLogChannel(
	event: 'join' | 'leave',
	guild: Guild,
	client: Client,
): Promise<void> {
	const { createdTimestamp, ownerId, memberCount, name, id } = guild;
	const defaultImage = 'https://cdn.discordapp.com/embed/avatars/0.png';

	let embed: MessageEmbed;
	if (event === 'join') {
		const owner = await guild.fetchOwner();

		embed = new MessageEmbed()
			.setTitle('> New guild! 🎉')
			.setDescription(`${name} (\`${id}\`)`)
			.setThumbnail(guild.iconURL() ?? defaultImage)
			.addFields(
				{
					name: 'Owner',
					value: `${owner.user.tag} (\`${ownerId}\`)`,
					inline: true,
				},
				{ name: 'Members', value: String(memberCount), inline: true },
				{
					name: 'Created in',
					value: `<t:${Math.floor(createdTimestamp / 1000)}>`,
					inline: true,
				},
			)
			.setFooter({ text: `Now I'm in ${client.guilds.cache.size} guilds!` })
			.setColor('GREEN');
	} else {
		embed = new MessageEmbed()
			.setTitle('> Left from a guild 😔')
			.setDescription(`${name} (\`${id}\`)`)
			.setThumbnail(guild.iconURL() ?? defaultImage)
			.addFields({ name: 'Members', value: String(memberCount) })
			.setFooter({ text: `Now I'm in ${client.guilds.cache.size} guilds!` })
			.setColor('RED');
	}

	const channel = client.channels.cache.get(
		process.env.GUILD_UPDATE_CHANNEL,
	) as TextChannel;
	try {
		channel.send({ embeds: [embed] });
	} catch {
		console.log('Erro ao enviar log de entrada/saída.')
	}
}
