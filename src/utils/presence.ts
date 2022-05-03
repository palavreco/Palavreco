/* eslint-disable no-mixed-spaces-and-tabs */
import { Client, ActivityOptions } from 'discord.js';

export function setUpPresence(client: Client): void {
    client.user!.setActivity({ type: 'PLAYING', name: '/adivinhar' });

    const ac: ActivityOptions[] = [
    	{ name: `em ${client.guilds.cache.size} servidores`, type: 'PLAYING' },
    	{ name: 'minhas engrenagens rodando', type: 'WATCHING' },
    	{ name: '/adivinhar', type: 'PLAYING' },
    	{ name: 'suas tentativas...', type: 'WATCHING' },
    ];

    setInterval(() => {
    	const activity = ac[Math.floor(Math.random() * ac.length)];
        client.user!.setActivity({ name: activity.name, type: activity.type });
    }, 900_000);
}
