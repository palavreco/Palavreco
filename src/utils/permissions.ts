import { CommandInteraction, PermissionString, TextChannel, User } from 'discord.js';

export function hasPermissions(int: CommandInteraction, permissions: PermissionString[]) {
	const channel = int.channel as TextChannel;

	const perms = permissions.map(perm => channel.permissionsFor(int.client.user as User)!.has(perm));
	return {
		has: !perms.includes(false),
		missing: permissions.filter((perm, i) => perms[i] === false),
	};
}
