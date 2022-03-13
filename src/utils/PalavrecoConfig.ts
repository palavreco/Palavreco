import { ActivityType, Collection, IntentsString, PermissionString, Snowflake } from "discord.js";
import { PalavrecoCommands } from "../scructures/BaseCommand";

export const PalavrecoConfig = {
    developers: [
        '392099429768888351', '535549399938367528',
        '762079458249146388'
    ] as Snowflake[],
    embedColor: '#2596be' as string,
    intents: ['GUILDS', 'GUILD_MESSAGES'] as IntentsString[],
    defaultPermissions: [
        'SEND_MESSAGES', 'MANAGE_MESSAGES',
        'USE_EXTERNAL_EMOJIS', 'VIEW_CHANNEL'
    ] as PermissionString[],
    activities: [
        { name: '/adivinhar', type: 'PLAYING' },
        { name: 'suas tentativas...', type: 'WATCHING' },
    ] as PalavrecoActivity[],
    supportServer: 'https://discord.gg/KEdytHNbK2' as string,
    botInvite: 'https://discord.com/oauth2/authorize?client_id=935291567038672906&permissions=273408&scope=bot%20applications.commands' as string,
};

export interface PalavrecoActivity {
    name: string;
    type: ActivityType;
}

export const PalavrecoOptions = {
    commands: new Collection<string, PalavrecoCommands>(),
    token: process.env.TOKEN as string,
}
