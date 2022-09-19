import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

export function runAtEndOf(endOf: 'day' | 'month', callback: () => void) {
	const time = +dayjs().tz('America/Sao_Paulo').endOf(endOf) + 1;
	const msUntilTime = time - +dayjs();
	const maximum = 2147483647;

	setTimeout(() => {
		runAtEndOf(endOf, callback);
	}, msUntilTime > maximum ? maximum : msUntilTime);
}
