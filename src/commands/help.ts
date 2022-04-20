import { CommandInteraction } from 'discord.js';
import { RESTPostAPIChatInputApplicationCommandsJSONBody } from 'discord-api-types/v10';
import { Command } from '../interfaces/Command';
import { letter } from '../utils/emotes.json';

export default class Help implements Command {
	commandStructure: RESTPostAPIChatInputApplicationCommandsJSONBody = {
		'name': 'ajuda',
		'description': 'Mostra como o jogo funciona',
	};

	dev = false;

	execute(interaction: CommandInteraction) {
		interaction.reply(helpText);
	}
}

const helpText = `
**Como jogar?**
Tente acertar a palavra em *6 tentativas*!
Para cada uma das tentativas é preciso o envio de uma mensagem que contenha uma palavra válida de 5 letras.
Após cada tentativa, a cor dos emojis mudará para mostrar o quão perto você estava.
        
**Exemplos:**
🇹 ${letter['green']['e']} 🇲 🇴 🇷
A letra **E** está na palavra e no lugar certo.
🇨 🇴 ${letter['yellow']['i']} 🇸 🇦
A letra **I** está na palavra mas no lugar errado.
🇦 🇹 🇮 ${letter['gray']['v']} 🇴
A letra **V** não está na palavra.
        
Uma palavra nova estará disponível todos os dias!
`;
