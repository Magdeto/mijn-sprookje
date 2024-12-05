import express from "express";
import { generateText } from "../controllers/text-generation.js";
import { generateImage } from "../controllers/image-generation.js";
import { generateSpeech } from "../controllers/text-to-speech.js";
import { generateTextFromSpeech } from "../controllers/speech-to-text.js";
import { saveAudioFile } from "../controllers/save-audio-file.js";
import multer from 'multer';

const upload = multer({ dest: 'uploads/'});

const router = express.Router();

router.post("/generate-text", generateText);
router.post("/generate-image", generateImage);
router.post("/generate-speech", generateSpeech);
router.post("/generate-text-from-speech", generateTextFromSpeech);
router.post('/save-audio-file', upload.single('audio'), saveAudioFile);

export default router;