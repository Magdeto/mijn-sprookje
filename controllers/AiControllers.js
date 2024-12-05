import { transcribeAudio, textToSpeech } from '../routes/AiServices.js';
import fs from 'fs';
import path from 'path';

// Controller to handle audio transcription requests
export const transcribeAudioController = async (req, res) => {
    try {
        let audioData;

        // Check if an audio file was uploaded via multer
        if (req.file) {
            audioData = { path: req.file.path };
        } else if (req.body.audioUrl) {
            audioData = { path: req.body.audioUrl };
        } else if (req.body.audio && req.body.audio.data) {
            const buffer = Buffer.from(req.body.audio.data, 'base64');
            const tempFilePath = path.join('uploads', `temp_audio_${Date.now()}.mp3`);
            await fs.promises.writeFile(tempFilePath, buffer);
            audioData = { path: tempFilePath };
        } else {
            return res.status(400).json({ error: 'No audio data provided' });
        }

        const transcription = await transcribeAudio(audioData);

        if (audioData.path.startsWith('uploads/temp_audio_')) {
            await fs.promises.unlink(audioData.path);
        }

        res.json({ transcription });
    } catch (error) {
        console.error('Transcription error:', error);
        res.status(500).json({ error: 'An error occurred during transcription' });
    }
};

// Controller to handle text-to-speech conversion requests
export async function textToSpeechController(req, res) {
    try {
        const { text } = req.body;

        if (!text) {
            return res.status(400).json({ error: "Text is required for conversion." });
        }

        const outputPath = "output.wav";
        const audioBuffer = await textToSpeech(text, outputPath);

        // Read the audio file to send as a response
        const audioFile = fs.readFileSync(outputPath);

        // Set headers to inform the browser it's audio
        res.setHeader('Content-Type', 'audio/wav');
        res.setHeader('Content-Disposition', 'inline; filename="output.wav"');

        // Send the audio file to the front-end
        res.send(audioFile);

        // Optionally clean up: Delete the file after sending if not needed
        fs.unlinkSync(outputPath);
    } catch (error) {
        console.error("Error in text-to-speech controller:", error);
        res.status(500).json({ error: error.message });
    }
}
