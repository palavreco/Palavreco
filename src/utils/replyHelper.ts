import templite, { Values } from 'templite';
import { log } from './log';
import messages from './messages.json';

export function t(replyName: keyof typeof messages, values?: Values): string {
	const reply: string = messages[replyName];

	if (!reply) {
		// Typescript shouldn't allow this to happen, but just in case
		log(`Message ${replyName} not found in messages.json`, 'REPLY', 'red');
		return replyName;
	}

	if (values) {
		return templite(reply, values);
	} else {
		return reply;
	}
}
