// Importa a classe responsável pela criação dos comandos
const { SlashCommandBuilder } = require('@discordjs/builders');
// Importa a classe que gerencia o envio de JSONs para o Discord
const { REST } = require('@discordjs/rest');
// Importa a constante que é usada para identificar o caminho que os comandos são mandados para o Discord
const { Routes } = require('discord-api-types/v9');
// Importa as informações frágeis do bot
const { clientId, guildId, token } = require('./secrets.json');

// Array de comandos do bot, que depois é passado para JSON
const commands = [
	new SlashCommandBuilder().setName('advinhar').setDescription('Tente advinhar a palavra do dia!'),
	new SlashCommandBuilder().setName('ajuda').setDescription('Mostra como o jogo funciona'),
]
	.map(command => command.toJSON());

// Cria uma nova instância de REST
const rest = new REST({ version: '9' }).setToken(token);

// Envia o array de comandos para o Discord, tornando os comandos disponíveis para uso
rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: commands })
	.then(() => console.log('Comandos atualizados com sucesso!'))
	.catch(console.error);