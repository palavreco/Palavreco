export function log(
	message: string,
	section: string,
	color: 'red' | 'green' | 'blue' | 'yellow' | 'purple',
): void {
	const d = new Date().toLocaleTimeString();
	const c = resolveColor(color);

	console.log(`${'\x1b[90m'}[${d}] ${c}[${section}]${'\x1b[0m'} ${message}`);
}

function resolveColor(color: string) {
	switch (color) {
	case 'red': return '\x1b[31m';
	case 'green': return '\x1b[32m';
	case 'blue': return '\x1b[34m';
	case 'yellow': return '\x1b[33m';
	case 'purple': return '\x1b[35m';
	default: return '\x1b[90m';
	}
}
