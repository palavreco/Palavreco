import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

export function runAtMidnight(callback: () => void) {
	const midnight = <number><unknown>dayjs().tz('America/Sao_Paulo').endOf('day') + 1;
	const msUntilMidnight = midnight - <number><unknown>dayjs();

	setTimeout(() => {
		callback();
		runAtMidnight(callback);
	}, msUntilMidnight);
}
