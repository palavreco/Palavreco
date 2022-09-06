import { Guild, PermissionString } from 'discord.js';

export function checkPermissions(
	permissions: PermissionString[] | undefined,
	guild: Guild,
): string[] | null {
	if (!permissions) return null;

	const booleans = permissions.map((p) =>
		guild.me!.permissions.has(p),
	);

	const missing = permissions
		.filter((p, i) => !booleans[i])
		.map((p) => `\`${p}\``);

	if (booleans.includes(false)) {
		return missing;
	} else {
		return null;
	}
}
