// Importa a classe Fyle System do Node.js
const fs = require('fs');
// Importa as classes do discord.js
const { Client, Collection, Intents } = require('discord.js');
// Importa as informações frageis do bot
require('dotenv').config();
// Cria uma nova instância do Client
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_MESSAGE_REACTIONS] });
// importa as funções de database
const { checkDatabase } = require('./utils/database.js');
// importa o loop para checar o horário
const { loopUtilMidnight } = require('./utils/reset.js');
// Cria uma Collection dos comandos do bot
client.commands = new Collection();
// Cria uma constante que recebe um array com todos os nomes dos arquivos terminados em .js na pasta comandos
const commandFiles = fs.readdirSync('./src/commands').filter(file => file.endsWith('.js'));

// Seta dinamicamente todos os comandos da pasta para o client.commands
for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	client.commands.set(command.data.name, command);
}
// Quando o Client estiver pronto, esse evento será disparado
client.once('ready', () => {
	const activities = [
		'Jogando Palavreco!',
		'/adivinhar',
		'Tentando acertar a palavra...',
	];
	// Seta a atividade do bot
	setInterval(() => {
		const random = Math.floor(Math.random() * (activities.length - 1) + 1);
		client.user.setActivity(activities[random], { type: 'PLAYING' });
	}, 300_000);
	// roda a função de loop para checar o horário
	console.log('O bot está pronto!');
	loopUtilMidnight();
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