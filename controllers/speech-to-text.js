import Replicate from "replicate";
import dotenv from "dotenv";
import { readFile } from "node:fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

dotenv.config();
const replicate = new Replicate({ auth: process.env.REPLICATE_API_TOKEN });

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const generateTextFromSpeech = async (req, res) => {
  try {
    // prompt received from client (index.js)
    const audioInput = path.join(__dirname, req.body.data);
    const audioFile = await readFile(audioInput)

    const input = {
        audio: audioFile,
        language: "Dutch",
    };

    // run speech-to-text generation model with Replicate's API
    const output = await replicate.run("zsxkib/whisper-lazyloading:909df2f50ba92488979e2c3dea577937b7e991bd815395d3dfbe3bcbf5038276", { input });

    // return response to client (index.js): send text string
    res.json({ transcript: output.transcription });
    console.log("Transcript:", output.transcription);
  } catch (error) {
    console.error("Error generating text: ", error.message);
    res.status(500).json({ error: "Failed to generate text" });
  }
};