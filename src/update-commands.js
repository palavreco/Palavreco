// Importa a classe que gerencia o envio de JSONs para o Discord
const { REST } = require('@discordjs/rest');
// Importa a constante que é usada para identificar o caminho que os comandos são mandados para o Discord
const { Routes } = require('discord-api-types/v9');
// Importa a função usada para ler os diretórios
const { readdirSync } = require('fs');
// importa o dotenv para ler as variáveis de ambiente
require('dotenv').config();
// Array de comandos do bot, que depois é passado para JSON
const commandsPath = require('path').join(__dirname, 'commands');
const commands = [];
readdirSync(commandsPath).forEach(file => {
	commands.push(require(`./commands/${file}`).data);
});

// Cria uma nova instância de REST
const rest = new REST({ version: '9' }).setToken(process.env.BOT_TOKEN);

// Envia o array de comandos para o Discord, tornando os comandos disponíveis para uso
rest.put(Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID), { body: commands })
	.then(() => console.log('Comandos atualizados com sucesso!'))
	.catch((error) => console.error(error));