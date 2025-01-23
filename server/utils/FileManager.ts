import { access, promises as fs } from 'fs';
import path from 'path';
import { bucket } from './s3.instance';

export class FileManager {
    /**
    * Saves file to a specified path under /public in an S3 bucket
    * @param savePath - Path relative to /public
    * @param file - The file to save (Buffer)
    * @returns the path to the saved file
    */
    static async saveFile(fileExtension: string, file: Buffer): Promise<string> {
        try {
            const fileName = `${crypto.randomUUID()}`
            const params = {
                Bucket: bucket,
                Key: `public/${fileName}.${fileExtension}`,
                Body: file,
                accessControl: 'public-read'
            }
            const data = await s3.upload(params).promise()
            return data.Location
        } catch (error) {
            console.error(error)
            throw error
        }
    }
}