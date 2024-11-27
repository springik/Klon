import { promises as fs } from 'fs';
import path from 'path';

export class FileManager {
    /**
    * Saves file to a specified path under /public
    * @param savePath - Path relative to /public
    * @param file - The file to save
    * @returns A promise that resolves when the file is saved
    */
    static async saveFile(savePath: string, file: Buffer): Promise<void> {
        try {
            const fullPath = path.join(process.cwd(), 'public', savePath);
            await fs.mkdir(path.dirname(fullPath), { recursive: true });
            await fs.writeFile(fullPath, file)
            console.log(`Saved file to ${fullPath}`)
        } catch (error) {
            console.error(error)
            throw error
        }
    }
}