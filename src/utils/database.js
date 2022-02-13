const { Client } = require('pg');
const fs = require('fs');
require('dotenv').config();

const client = new Client({
	connectionString: process.env.DATABASE_URL,
	ssl: { rejectUnauthorized: false },
});

module.exports = {
	async checkWordDatabase() {
		const wordDatabase = await client.query('SELECT word, status FROM words WHERE status = true');
		console.log(wordDatabase.rows[0]['status']);
		if (wordDatabase.rows[0]['status'] === true) {
			return wordDatabase.rows[0]['word'];
		}
		else {
			const data = fs.readFileSync('src/utils/palavras.txt', 'utf8');
			const words = data.split('\n');
			const wordRandom = words[Math.floor(Math.random() * words.length)].replace('\r', '');
			client.query(`INSERT into words(word, status) VALUES ('${wordRandom}', true)`);
			console.log(wordRandom);
			return wordRandom;
		}
	},
	async newWord() {
		const data = fs.readFileSync('src/utils/palavras.txt', 'utf8');
		const words = data.split('\n');
		const wordRandom = words[Math.floor(Math.random() * words.length)].replace('\r', '');
		await client.query('UPDATE words SET status = false WHERE status = true');
		await client.query('UPDATE users SET status = true WHERE status = false');
		await client.query(`INSERT into words(word, status) VALUES ('${wordRandom}', true)`);
	},

	async checkDatabase() {
		client.connect();

		const tableUsers = 'CREATE TABLE IF NOT EXISTS "users" ("id" TEXT, "status" BOOLEAN);';
		const tableWords = 'CREATE TABLE IF NOT EXISTS "words" ("word" TEXT, "status" BOOLEAN);';

		await client.query(tableUsers).then(console.log('Tabela users criada/verificada!'));
		await client.query(tableWords).then(console.log('Tabela words criada/verificada!'));
	},
	async insertUser(user) {
		await client.query(`INSERT into users (id, status) VALUES ('${user}', status = true) ON CONFLICT (user) DO UPDATE SET status = `);
	},
	// Adicionar o checkUser()
};