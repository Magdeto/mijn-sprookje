import { writeFile } from "node:fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const saveAudioFile = async(req, res) =>{
    try {
        const inputPath = req.file.path; 
        const targetPath = path.join(__dirname, '../public/assets/generated-audio/recorded_audio.wav'); 

        const audioData = await fs.promises.readFile(inputPath); 
        await writeFile(targetPath, audioData); 

        await fs.promises.unlink(inputPath); 
        res.json({ audioFile: `recorded_audio.wav`}); 

        console.log("File saved successfully")
    } catch (error) { 
        console.error('Error saving file:', error); 
        res.status(500).json({ error: 'Error saving file' }); 
    }
}