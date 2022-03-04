const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');

dayjs.extend(utc);
dayjs.extend(timezone);

module.exports = {
	runAtMidnight(callback) {
		const midnight = dayjs().tz('America/Sao_Paulo').endOf('day') + 1;
		const msUntilMidnight = midnight - dayjs();

		setTimeout(() => {
			callback();
			this.runAtMidnight(callback);
		}, msUntilMidnight);
	},
};
