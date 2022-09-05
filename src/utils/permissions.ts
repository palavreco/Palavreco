import { CommandInteraction, PermissionString } from 'discord.js';

export function getMissingPermissions(
	permissions: PermissionString[] | undefined,
	interaction: CommandInteraction,
): string[] | null {
	if (!permissions) return null;

	const { guild } = interaction;

	const permissionsBooleans = permissions.map((p) =>
		guild!.me!.permissions.has(p),
	);
	const missingPermissions = permissions
		.filter((p, i) => !permissionsBooleans[i])
		.map((p) => `\`${p}\``);

	if (permissionsBooleans.includes(false)) {
		return missingPermissions;
	} else {
		return null;
	}
}
