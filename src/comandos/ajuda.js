const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ajuda')
        .setDescription('Mostra como o jogo funciona'),
    async execute(interaction) {
        await interaction.reply(`
**Como jogar?**
Tente acertar a palavra em *6 tentativas*!
Para cada uma das tentativas é preciso o envio de uma mensagem que contenha uma palavra válida de 5 letras.
Após cada tentativa, a cor dos emojis mudará para mostrar o quão perto você estava.
        
**Exemplos:**
:regional_indicator_t::regional_indicator_e::regional_indicator_m::regional_indicator_o::regional_indicator_r: - A letra E está na palavra e no lugar certo.
:regional_indicator_c::regional_indicator_o::regional_indicator_i::regional_indicator_s::regional_indicator_a: - A letra O está na palavra e no lugar errado.
:regional_indicator_a::regional_indicator_t::regional_indicator_i::regional_indicator_v::regional_indicator_o: - A letra V não está na palavra.
        
Uma palavra nova estará disponível todos os dias!
        `);
    }
}