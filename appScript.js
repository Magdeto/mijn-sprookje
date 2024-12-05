// Importing required modules
import express from 'express'; 
import dotenv from 'dotenv'; 
import cors from 'cors'; 
import { transcribeAudioController, textToSpeechController } from './controllers/AiControllers.js';
import {combinedAiController } from './controllers/combinedAiController.js';
import path from 'path';  // For handling file paths

dotenv.config(); 

const app = express();

// Middleware
app.use(cors()); // Allow cross-origin requests
app.use(express.json({ limit: '50mb' })); // For large JSON payloads
app.use(express.urlencoded({ extended: true })); // For URL encoded bodies

// Serve static files from the 'public' folder
app.use(express.static(path.join(path.resolve(), 'public')));  // This serves static assets like HTML, JS, CSS

// Define API routes
app.post('/ai/audioToText', transcribeAudioController);
app.post('/ai/textToAudio', textToSpeechController);
app.post('/ai/combined', combinedAiController);
// Root route to serve the storytelling.html file
app.get("/", (req, res) => {
    res.sendFile(path.join(path.resolve(), 'public', 'storytelling.html'));  // Change to 'storytelling.html'
});

// Define the port
const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
