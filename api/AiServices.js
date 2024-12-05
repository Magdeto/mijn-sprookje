// Import necessary libraries and modules
import Replicate from "replicate"; // Used for accessing the Replicate API
import dotenv from "dotenv"; // Loads environment variables from a .env file
import fs from 'fs'; // Provides file system utilities
import { processReadableStream } from '../StreamHelpers.js'; // Custom helper function for processing ReadableStreams
dotenv.config(); // Load environment variables from the .env file

// Initialize Replicate API with authentication using an environment variable
const replicate = new Replicate({
    auth: process.env.REPLICATE_API_TOKEN, // API token is stored securely in the environment
});

// Function to transcribe audio files using the Replicate API
export async function transcribeAudio(audioData) {
    try {
        console.log("Starting transcription request...");

        // Validate input: Ensure audio data and its path are provided
        if (!audioData || !audioData.path) {
            throw new Error("Invalid audio data provided");
        }

        // Check if the specified audio file exists
        if (!fs.existsSync(audioData.path)) {
            throw new Error(`File not found: ${audioData.path}`);
        }

        // Read the audio file and convert it to a base64 string
        const audioBuffer = fs.readFileSync(audioData.path);
        const base64Audio = audioBuffer.toString('base64');

        // Create a Data URI for the audio file
        const audioDataUri = `data:audio/mp3;base64,${base64Audio}`;

        // Prepare input data for the API request
        const input = {
            audio: audioDataUri
        };

        // Call the Replicate API to transcribe the audio
        const output = await replicate.run(
            "zsxkib/whisper-lazyloading:909df2f50ba92488979e2c3dea577937b7e991bd815395d3dfbe3bcbf5038276", // API model for transcription
            { input }
        );

        // Return the transcription result
        return output;
    } catch (error) {
        console.error("Error occurred during transcription:", error);
        throw error; // Rethrow the error to notify the caller
    }
}

// Function to convert text to speech using the Replicate API
export async function textToSpeech(text, outputPath = "output.wav") {
    try {
        console.log("Starting text-to-speech conversion...");

        // Validate input: Ensure text is provided for conversion
        if (!text) {
            throw new Error("No text provided for conversion");
        }

        // Prepare input data for the API request, including the text, speaker, and language
        const input = {
            text: text,
            speaker: "https://replicate.delivery/pbxt/Jt79w0xsT64R1JsiJ0LQRL8UcWspg5J4RFrU6YwEKpOT1ukS/male.wav", // Default speaker audio
            language: "nl" // Language for the output speech
        };

        // Call the Replicate API to convert text to speech
        const output = await replicate.run(
            "lucataco/xtts-v2:684bc3855b37866c0c65add2ff39c78f3dea3f4ff103a436465326e0f438d55e", // API model for text-to-speech
            { input }
        );

        // Check if the output is a readable stream (audio file)
        if (output instanceof ReadableStream) {
            const audioBuffer = await processReadableStream(output, outputPath); // Save the stream to a file
            return audioBuffer; // Return the audio buffer
        } else {
            console.error("Output is not a ReadableStream:", output);
            throw new Error("Unexpected API response type"); // Handle unexpected response types
        }
    } catch (error) {
        console.error("Error occurred during text-to-speech conversion:", error);

        // Log additional API error details if available
        if (error.response) {
            try {
                const errorText = await error.response.text(); // Parse and log the API error response
                console.error("API error response:", errorText);
            } catch (e) {
                console.error("Could not read error response:", e); // Handle errors when reading the response
            }
        }
        throw error; // Rethrow the error to notify the caller
    }
}