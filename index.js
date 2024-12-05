// Import required modules
import express from 'express';
import cors from 'cors';
import Replicate from 'replicate';
import dotenv from 'dotenv';
import { writeFile } from "node:fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);


// Load environment variables from .env file
dotenv.config();


// Initialize Express app
const app = express();
app.use(express.static(path.join(__dirname, 'public')));

// Middleware
app.use(express.json()); // Parse incoming JSON data
app.use(cors()); // Allow requests from other domains (important for frontend-backend communication)
app.use(express.static(path.join(__dirname, "public")));


// Initialize Replicate
const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN, // Your API key for the Replicate API
  userAgent: 'https://www.npmjs.com/package/create-replicate'
});

//Define the model
const model = 'black-forest-labs/flux-schnell:bf53bdb93d739c9c915091cfa5f49ca662d11273a5eb30e7a2ec1939bcf27a00';

//test route
app.get('/', (req, res) => {
  res.send('Server is running and ready for requests!');
});


//Route to generate images 
app.post('/generate-image', async (req, res) => {
  const { prompt } = req.body; // Extract 'prompt' from the incoming JSON request
  console.log('Received request:', req.body);

  try {
    // Use Replicate API to generate images
    const output = await replicate.run(model, {
      input: {
        prompt,
        go_fast: true,
        num_outputs: 2, // Request two outputs
        aspect_ratio: '3:2',
        output_format: 'webp',
        output_quality: 80,
      },
    });

    const filePaths = [];

    console.log('Replicate API Output:', output); // Log the structure of the output

    // Save each generated image to disk
    for (const [index, item] of Object.entries(output)) {
      const filePath =path.join("public", `/output_${index}.webp`);
      await writeFile(filePath, item); // Save the image
      console.log(`Image saved: ${filePath}`);
      filePaths.push(`/output_${index}.webp`); // Add the file path to the response array
    }

    // Send back the file paths of the generated images
    res.json({ images: filePaths });

  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).json({ error: 'Failed to generate images' }); // Send error if something goes wrong
  }
});


//route to generate text
app.post('/generate-text', async (req, res) => {
  const { prompt } = req.body; // Extract prompt from request body

  const input = {
    top_k: 0,
    top_p: 1,
    prompt,
    max_tokens: 512,
    temperature: 0.75,
    system_prompt: "You are a helpful, respectful, and honest narrator. Always answer as helpfully as possible, while being safe. Your stories should under any circumstances include violence, harmfull behaviour, sexual, racist or illegal activities. You are determined to narrate stories for young kids aged 4-6 years-old so do not use techical or academic language. You start the story immediatelly without any additional comments or polite responses. It should be no longer than 50 words.",
    length_penalty: 1,
    max_new_tokens: 800,
    prompt_template: "<s>[INST] <<SYS>>\n{system_prompt}\n<</SYS>>\n\n{prompt} [/INST]",
    presence_penalty: 0,
    log_performance_metrics: false,
  };

  try {
    let generatedText = '';
    for await (const event of replicate.stream("meta/llama-2-7b-chat", { input })) {
      generatedText += event.toString(); // Collect generated text
    }

    // Send the collected text to the client
    res.json({ text: generatedText.trim() });
  } catch (error) {
    console.error('Error generating text:', error);
    res.status(500).json({ error: 'Failed to generate text' });
  }
});


// Start the server

const PORT = 5000; // Define the port number
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`); // Log the server start message
});


