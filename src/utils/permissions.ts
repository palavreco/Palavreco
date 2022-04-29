import { CommandInteraction, PermissionString, TextChannel } from 'discord.js';
import { t } from './replyHelper';
import { check } from './emotes.json';

export function hasPermissions(
	permissions: PermissionString[],
	interaction: CommandInteraction,
): boolean {
	if (!permissions) return true;

	const { user, channel } = interaction;
	const c = channel as TextChannel;

	const permissionsBooleans = permissions.map(p => !c.permissionsFor(user)!.has(p));
	const missingPermissions = (permissions.filter((p, i) => !permissionsBooleans[i])).map(p => `\`${p}\``);

	if (permissionsBooleans.includes(false)) {
		interaction.reply(t('missing_permissions', {
			redTick: check.red,
			perms: missingPermissions.join(' '),
		}));

		return false;
	} else {
		return true;
	}
}
