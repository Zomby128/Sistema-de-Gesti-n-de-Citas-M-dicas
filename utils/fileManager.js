const fs = require('fs').promises;
const path = require('path');

class FileManager {
    constructor(fileName) {
        this.filePath = path.join(__dirname, '../data', fileName);
    }

    async readData() {
        try {
            const data = await fs.readFile(this.filePath, 'utf8');
            return JSON.parse(data);
        } catch (error) {
            // Si el archivo no existe, retornar array vacío
            if (error.code === 'ENOENT') {
                return [];
            }
            throw error;
        }
    }

    async writeData(data) {
        try {
            // Asegurar que el directorio existe
            await fs.mkdir(path.dirname(this.filePath), { recursive: true });
            await fs.writeFile(this.filePath, JSON.stringify(data, null, 2));
            return true;
        } catch (error) {
            throw error;
        }
    }

    async getNextId(prefix) {
        const data = await this.readData();
        if (data.length === 0) return `${prefix}001`;
        
        const lastId = data[data.length - 1].id;
        const number = parseInt(lastId.replace(prefix, '')) + 1;
        return `${prefix}${number.toString().padStart(3, '0')}`;
    }
}

module.exports = FileManager;