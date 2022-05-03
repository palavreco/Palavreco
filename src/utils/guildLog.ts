import { Client, Guild, MessageEmbed, TextChannel } from 'discord.js';

export async function notifyLogChannel(event: 'join' | 'leave', guild: Guild, client: Client): Promise<void> {
	const { createdTimestamp, ownerId, memberCount, name, id } = guild;
	const owner = await guild.fetchOwner();

	let embed: MessageEmbed;
	if (event === 'join') {
		embed = new MessageEmbed()
			.setAuthor({ name: `${name} (${id})` }).setTitle('Novo servidor!')
			.addFields(
				{ name: 'Owner', value: `\`${owner.user.tag}\` (${ownerId})`, inline: true },
				{ name: 'Members', value: `${memberCount}`, inline: true },
				{ name: 'Created in', value: `<t:${Math.floor(createdTimestamp / 1000)}>`, inline: true },
			)
			.setFooter({ text: `Now I'm in ${client.guilds.cache.size} servidores!` })
			.setColor('GREEN');
	} else {
		embed = new MessageEmbed()
			.setAuthor({ name: `${name} (${id})` }).setTitle('Saí de um servidor :(')
			.addFields(
				{ name: 'Dono', value: `\`${owner}\` (${ownerId})`, inline: true },
			).setFooter({ text: `Agora estou em ${client.guilds.cache.size} servidores!` }).setColor('#2f3136');

	}

	const channel = client.channels.cache.get(process.env.GUILD_UPDATE_CHANNEL) as TextChannel;
	channel.send({ embeds: [embed] });
}