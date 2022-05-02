import { CommandInteraction, PermissionString } from 'discord.js';

export function hasPermissions(
	permissions: PermissionString[],
	interaction: CommandInteraction,
): { success: boolean, message?: string } {
	if (!permissions) return { success: true };

	const { guild } = interaction;

	const permissionsBooleans = permissions.map(p => guild!.me!.permissions.has(p));
	const missingPermissions = (permissions.filter((p, i) => !permissionsBooleans[i])).map(p => `\`${p}\``);

	if (permissionsBooleans.includes(false)) {
		return { success: false, message: missingPermissions.join(' ') };
	} else {
		return { success: true };
	}
}
