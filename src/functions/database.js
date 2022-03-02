const { Client } = require('pg');
const fs = require('fs');

const client = new Client({
	connectionString: process.env.DATABASE_URL,
	ssl: { rejectUnauthorized: false },
});

module.exports = {
	async checkWordDatabase() {
		const wordDatabase = await client.query('SELECT word, status FROM words WHERE status = true');
		if (wordDatabase.rows[0]['status'] === true) {
			return wordDatabase.rows[0]['word'];
		}
		else {
			const data = fs.readFileSync('src/utils/wordsList.txt', 'utf8');
			const words = data.split('\n');
			const randomWord = words[Math.floor(Math.random() * words.length)].replace('\r', '');
			client.query(`INSERT into words(word, status) VALUES ('${randomWord}', true)`);
			return randomWord;
		}
	},
	async checkUserDatabase(userId) {
		const userDatabase = await client.query(`SELECT id, status FROM users WHERE id = '${userId}'`);
		if (userDatabase.rows.length === 0) {
			await client.query(`INSERT into users(id, status) VALUES ('${userId}', false)`);
			return 'notRegistered';
		}
		else if (userDatabase.rows[0]['status'] === true) {
			return 'alreadyPlayed';
		}
	},
	async itPlayed(userId) {
		await client.query(`UPDATE users SET status = true WHERE id = '${userId}'`);
	},
	async resetPlayedUser(userId) {
		const userDatabase = await client.query(`SELECT id, status FROM users WHERE id = '${userId}'`);
		if (userDatabase.rows[0]['status'] === false) return 'alreadyFalse';
		await client.query(`UPDATE users SET status = false WHERE id = '${userId}'`);
	},
	async newWord() {
		const data = fs.readFileSync('src/utils/wordsList.txt', 'utf8');
		const words = data.split('\n');
		const randomWord = words[Math.floor(Math.random() * words.length)].replace('\r', '');
		await client.query('UPDATE words SET status = false WHERE status = true');
		await client.query(`INSERT into words(word, status) VALUES ('${randomWord}', true)`);
		await client.query('DETETE FROM users');
	},
	async checkDatabase() {
		client.connect();

		const tableUsers = 'CREATE TABLE IF NOT EXISTS "users" ("id" TEXT, "status" BOOLEAN);';
		const tableWords = 'CREATE TABLE IF NOT EXISTS "words" ("word" TEXT, "status" BOOLEAN);';

		await client.query(tableUsers).then(console.log('Tabela users criada/verificada!'));
		await client.query(tableWords).then(console.log('Tabela words criada/verificada!'));
	},
	async getDayNumber() {
		const words = await client.query('SELECT * FROM words');
		return words.rows.length;
	},
};