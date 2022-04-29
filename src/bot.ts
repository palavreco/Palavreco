import fs from 'node:fs';
import dotenv from 'dotenv';
import { ActivityOptions, Client, Collection, Guild, MessageEmbed, TextChannel } from 'discord.js';
import { Command } from './interfaces/Command';
import { newWord, setUp } from './database';
import { hasPermissions } from './utils/permissions';
import { log } from './utils/log';
import { runAtMidnight } from './utils/runner';
dotenv.config();

const client = new Client({ intents: ['GUILDS', 'GUILD_MESSAGES', 'GUILD_MESSAGE_REACTIONS'] });
let cLog: TextChannel;

client.once('ready', () => {
	log('Client is ready', 'BOT', 'green');

	client.user!.setActivity({ type: 'PLAYING', name: '/adivinhar' });

	const ac: ActivityOptions[] = [
		{ name: `em ${client.guilds.cache.size} servidores`, type: 'PLAYING' },
		{ name: '/adivinhar', type: 'PLAYING' },
		{ name: 'suas tentativas...', type: 'WATCHING' },
	];
	setInterval(() => {
		const activity = ac[Math.floor(Math.random() * ac.length)];
		client.user!.setActivity({ name: activity.name, type: activity.type });
	}, 900_000);

	cLog = client.channels.cache.get(process.env.GUILD_UPDATE_CHANNEL) as TextChannel;
});

client.on('guildCreate', async (guild: Guild) => {
	const { createdTimestamp, ownerId, memberCount, name, id } = guild;

	const owner = await guild.fetchOwner();
	const embed = new MessageEmbed()
		.setAuthor({ name: `${name} (${id})` }).setTitle('Novo servidor!')
		.addFields(
			{ name: 'Dono', value: `\`${owner.user.tag}\` (${ownerId})`, inline: true },
			{ name: 'Membros', value: `${memberCount}`, inline: true },
			{ name: 'Criado em', value: `<t:${Math.floor(createdTimestamp / 1000)}>`, inline: true },
		).setFooter({ text: `Agora estou em ${client.guilds.cache.size} servidores!` }).setColor('#2f3136');

	cLog.send({ embeds: [embed] });
	log(`Joined ${name} (${id})`, 'BOT', 'blue');
});

client.on('guildDelete', async (guild: Guild) => {
	const { ownerId, name, id } = guild;

	const owner = await guild.fetchOwner().then(o => o.user.tag);
	const embed = new MessageEmbed()
		.setAuthor({ name: `${name} (${id})` }).setTitle('Saí de um servidor :(')
		.addFields(
			{ name: 'Dono', value: `\`${owner}\` (${ownerId})`, inline: true },
		).setFooter({ text: `Agora estou em ${client.guilds.cache.size} servidores!` }).setColor('#2f3136');

	cLog.send({ embeds: [embed] });
	log(`Left ${name} (${id})`, 'BOT', 'red');
});

const botCmds: Collection<string, Command> = new Collection();
const cmdsFolder = fs.readdirSync('./src/commands');

for (const file of cmdsFolder) {
	const name = file.split('.')[0];
	const cmd = import(`./commands/${name}`);

	cmd.then(command => {
		const cmdInstance: Command = new command.default();
		botCmds.set(cmdInstance.commandStructure.name, cmdInstance);
	});
}

client.on('interactionCreate', i => {
	if (!i.isCommand()) return;

	const command = botCmds.get(i.commandName);

	if (command) {
		if (!hasPermissions(command.permissions!, i)) return;

		command.execute(i);
	}
});

client.login(process.env.TOKEN);
setUp();

runAtMidnight(() => {
	newWord();
	log('New word & users reseted!', 'DB', 'purple');
});
