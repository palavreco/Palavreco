import { CommandInteraction, PermissionString, TextChannel } from 'discord.js';
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
		interaction.reply([
			`${check.red} Eu não tenho permissão para executar este comando, `,
			'por favor edite meu cargo a partir das informações abaixo.\n',
			`**Permissões necessárias: ${missingPermissions.join(' ')}**`,
		].join(''));

		return false;
	} else {
		return true;
	}
}
