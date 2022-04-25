import { CommandInteraction, PermissionString, TextChannel, User } from 'discord.js';
import { check } from './emotes.json';

export function hasPermissions(int: CommandInteraction, permissions: PermissionString[]) {
	const channel = int.channel as TextChannel;

	const perms = permissions.map(perm => channel.permissionsFor(int.client.user as User)!.has(perm));
	const hasPerms = !perms.includes(false);

	const p = permissions.filter((perm, i) => perms[i] === false);
	const missingP = p.map(per => `**\`${per}\`**`).join(' ');
	if (!hasPerms) {
		int.reply(`${check.red} É preciso das permissões ${missingP} para executar esse comando.`);
	}

	return hasPerms ? true : false;
}
