const { newWord } = require('./database.js');
const moment = require('moment-timezone');

module.exports = {
	loopUtilMidnight() {
		setInterval(() => {
			const braziliamTime = moment().tz('America/Sao_Paulo').format('HH:mm');
			if (braziliamTime === '23:45') {
				newWord();
				console.log('Meia noite! Palavra trocada!');
			}
		}, 50_000);
	},
};