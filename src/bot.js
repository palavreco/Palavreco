// Importa a classe Fyle System do Node.js
const fs = require('fs');
// Importa as classes do discord.js
const { Client, Collection, Intents, MessageEmbed } = require('discord.js');
// Importa as informações frageis do bot
require('dotenv').config();
// Cria uma nova instância do Client
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_MESSAGE_REACTIONS] });
// importa as funções de database
const { checkDatabase } = require('./functions/database.js');
// importa a função para trocar a palavra
const { newWord } = require('./database.js');
// importa a função para iniciar o timer
const { runAtMidnight } = require('./functions/runner');
// Cria uma Collection dos comandos do bot
client.commands = new Collection();
// Cria uma constante que recebe um array com todos os nomes dos arquivos terminados em .js na pasta comandos
const commandFiles = fs.readdirSync('./src/commands').filter(file => file.endsWith('.js'));

// Seta dinamicamente todos os comandos da pasta para o client.commands
for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	client.commands.set(command.data.name, command);
}

client.once('ready', () => {
	client.user.setActivity({ type: 'PLAYING', name: '/adivinhar' });
});

// Quando o Client estiver pronto, esse evento será disparado
client.once('ready', () => {
	// loop de status
	setInterval(() => {
		const activities = [
			{ type: 'PLAYING', name: `em ${client.guilds.cache.size} servidores` },
			{ type: 'PLAYING', name: '/adivinhar' },
			{ type: 'WATCHING', name: 'suas tentativas...' },
		];
		const randomActivity = activities[Math.floor(Math.random() * activities.length)];
		client.user.setActivity(randomActivity.name, { type: randomActivity.type });
	}, 900_000);
	// console log para informar que o bot está online
	console.log('Bot pronto!');
	// loop de reset
	runAtMidnight(() => {
		newWord();
		console.log('Meia noite! Palavra trocada!');
	});
});

// manda mensagem se foi adicionado em algum servidor
client.on('guildCreate', async guild => {
	const guildsChannel = client.channels.cache.get(process.env.GUILDS_CHANNEL);
	const guildCreateTimestamp = guild.createdTimestamp;
	const ownerGuild = await guild.fetchOwner().then(owner => owner.user.tag);
	const embed = new MessageEmbed()
		.setAuthor({ name: `${guild.name} (${guild.id})` })
		.setTitle('Novo servidor!')
		.addFields(
			{ name: 'Dono', value: `\`${ownerGuild}\` (${guild.ownerId})`, inline: true },
			{ name: 'Membros', value: `${guild.memberCount}`, inline: true },
			{ name: 'Criado em', value: `<t:${Math.floor(guildCreateTimestamp / 1000)}>`, inline: true },
		)
		.setFooter({ text: `Agora estou em ${client.guilds.cache.size} servidores!` })
		.setColor('#2f3136');
	guildsChannel.send({ embeds: [embed] });
});

// Manda mensagem se foi tirado de algum servidor
client.on('guildDelete', async guild => {
	const guildsChannel = client.channels.cache.get(process.env.GUILDS_CHANNEL);
	const ownerGuild = await guild.fetchOwner().then(owner => owner.user.tag);
	const embed = new MessageEmbed()
		.setAuthor({ name: `${guild.name} (${guild.id})` })
		.setTitle('Saí de um servidor :(')
		.addFields(
			{ name: 'Dono', value: `\`${ownerGuild}\` (${guild.ownerId})`, inline: true },
		)
		.setFooter({ text: `Agora estou em ${client.guilds.cache.size} servidores!` })
		.setColor('#2f3136');
	guildsChannel.send({ embeds: [embed] });
});

// Quando houver um evento de interação, o bot irá executar o comando correspondente
client.on('interactionCreate', async interaction => {
	// Checa se a interação é um comando, se não for, apenas não retorna nada
	if (!interaction.isCommand()) return;

	// Pega o nome do comando
	const command = client.commands.get(interaction.commandName);

	try {
		// Executa o comando
		await command.execute(interaction);
	}
	catch (error) {
		// Caso ocorra algum erro, o bot irá enviar uma mensagem de erro
		console.error(error);
		if (interaction.replied) {
			// Caso o bot já tenha respondido ao usuário, o reply será editado
			await interaction.editReply('Minhas engrenagens estão um pouco lentas, tente novamente!');
		}
		else {
			// Caso o bot ainda não tenha respondido ao usuário, o reply será enviado
			await interaction.reply('Minhas engrenagens estão um pouco lentas, tente novamente!');
		}
	}
});

// O Client loga no Discord pelo token e checa a database
checkDatabase();
client.login(process.env.TOKEN);