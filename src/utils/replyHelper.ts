import templite, { Values } from 'templite';
import { log } from './log';
import messages from './messages.json';

export function t(replyName: string, values?: Values): string {
	// @ts-ignore - Safe to ignore, there is a conditional check it
	const reply: string = messages[replyName];

	if (!reply) {
		log(`Message ${replyName} not found in messages.json`, 'REPLY', 'red');
		return replyName;
	}

	if (values) {
		return templite(reply, values);
	} else {
		return reply;
	}
}
