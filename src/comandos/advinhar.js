const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('advinhar')
        .setDescription('Tente advinhar a palavra do dia'),
    async execute(interaction){
        await interaction.reply(`Soon\:tm: :tools:`);
    }
}