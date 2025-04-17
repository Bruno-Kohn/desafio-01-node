import fs from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const databasePath = join(__dirname, 'database.json');

export class Database {
    #database = {};

    constructor() {
        fs.readFile(databasePath, 'utf-8')
            .then(data => {
                this.#database = JSON.parse(data);
            })
            .catch(() => {
                this.#persist();
            });
    }

    #persist() {
        fs.writeFile(databasePath, JSON.stringify(this.#database));
    }

    select(table) {
        return this.#database[table] ?? [];
    }

    insert(table, data) {
        if (!this.#database[table]) {
            this.#database[table] = [];
        }

        this.#database[table].push(data);
        this.#persist();

        return data;
    }

    update(table, id, data) {
        const rowIndex = this.#database[table].findIndex(row => row.id === id);

        if (rowIndex > -1) {
            this.#database[table][rowIndex] = { ...this.#database[table][rowIndex], ...data };
            this.#persist();
        }
    }

    delete(table, id) {
        const rowIndex = this.#database[table].findIndex(row => row.id === id);

        if (rowIndex > -1) {
            this.#database[table].splice(rowIndex, 1);
            this.#persist();
        }
    }
} 