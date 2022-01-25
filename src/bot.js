// Importa a classe Fyle System do Node.js
const fs = require('fs');
// Importa as classes do discord.js
const { Client, Collection, Intents } = require('discord.js');
// Importa as informações frageis do bot 
const { token } = require('./secrets.json');

// Cria uma nova instância do Client
const client = new Client({ intents: [Intents.FLAGS.GUILDS] });

// Cria uma Collection dos comandos do bot
client.commands = new Collection();
// Cria uma constante que recebe um array com todos os nomes dos arquivos terminados em .js na pasta comandos
const commandFiles = fs.readdirSync('./src/comandos').filter(file => file.endsWith('.js'));

// Seta dinamicamente todos os comandos da pasta para o client.commands
for (const file of commandFiles) {
	const command = require(`./comandos/${file}`);
	client.commands.set(command.data.name, command);
}

// Quando o Client estiver pronto, esse evento será disparado
client.once('ready', () => {
	console.log('O bot está pronto!');
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
	} catch (error) {
		// Caso ocorra algum erro, o bot irá enviar uma mensagem de erro
		console.error(error);
		await interaction.reply('Minhas engrenagens estão um pouco lentas, tente novamente!');
	}
});

// O Client loga no Discord pelo token
client.login(token);