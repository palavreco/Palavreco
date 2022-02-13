const { Client } = require('pg');
const { newWord } = require('./database.js');
const { channelNewWord } = require('../secrets.json');


const client = new Client({
	connectionString: process.env.DATABASE_URL,
	ssl: { rejectUnauthorized: false },
});

function convertToTimestamp(string) {
	return new Date(string).getTime();
}

module.exports = {
	async loopUtilMidnight() {
		setInterval(async () => {
			const brazilianTime = convertToTimestamp(new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' }));
			const timeStamp1 = new Date(brazilianTime).setHours(0, 0, 0, 59);
			const timeStamp2 = new Date(brazilianTime).setHours(0, 0, 59, 59);
			if (brazilianTime >= timeStamp1 && brazilianTime <= timeStamp2) {
				await client.query('UPDATE users SET status = true WHERE status = false');
				newWord();
				channelNewWord.send('Palavra trocada!');
			}
		});
	},
};