import { transcribeAudio, textToSpeech } from '../routes/AiServices.js';
import { generateText } from '../controllers/text-generation.js';
import fs from 'fs';
import path from 'path';

export const combinedAiController = async (req, res) => {
    try {
        // Step 1: Transcribe audio
        let audioData;
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

        const transcriptionResult = await transcribeAudio(audioData);

        if (audioData.path.startsWith('uploads/temp_audio_')) {
            await fs.promises.unlink(audioData.path);
        }
        const transcription = transcriptionResult.transcription;
        // Step 2: Generate text based on transcription
        const generatedText = await generateText({ body: { prompt: transcription } }, { json: () => {} });

        // Step 3: Convert generated text to speech
        const outputPath = "output.wav";
        const audioBuffer = await textToSpeech(generatedText, outputPath);
        const audioFile = fs.readFileSync(outputPath);
        // Send the audio file to the front-end
        res.setHeader('Content-Type', 'audio/wav');
        res.setHeader('Content-Disposition', 'inline; filename="output.wav"');
        res.send(audioFile);

        // Clean up: Delete the file after sending
        fs.unlinkSync(outputPath);
    } catch (error) {
        console.error('Error in combined AI controller:', error);
        res.status(500).json({ error: 'An error occurred during processing' });
    }
};