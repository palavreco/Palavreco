import { ActivityType, Collection, IntentsString, PermissionString, Snowflake } from 'discord.js';
import { PalavrecoCommands } from './BaseCommand';

export interface PalavrecoSettings {
    developers: Snowflake[];
    embedColor: string;
    intents: IntentsString[];
    defaultPermissions: PermissionString[];
    activities: PalavrecoActivity[];
    supportServer: string;
    botInvite: string;
}

export interface PalavrecoFundamentals {
    commands: Collection<string, PalavrecoCommands>;
    token: string;
}

export interface PalavrecoActivity {
    name: string;
    type: ActivityType;
}
