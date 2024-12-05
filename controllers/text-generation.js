import Replicate from "replicate";
import dotenv from "dotenv";

dotenv.config();
const replicate = new Replicate({ auth: process.env.REPLICATE_API_TOKEN })

export const generateText = async (req, res) => {
  try {
    // prompt received from client (index.js)
    const prompt = req.body.prompt;

    // store generated text in a string
    let generatedText = "";

    const input = {
      prompt,
      system_prompt: `You are a helpful, respectful, and honest narrator. Always answer as helpfully as 
      possible, while being safe. You are determined to narrate stories for young 
      kids aged 4-6 years-old so do not use techical or academic language. You start the story immediatelly 
      without any additional comments or polite responses. Translate everything to Dutch.`,
    };

    // run text generation model with Replicate's API
    for await (const event of replicate.stream(
      "meta/meta-llama-3-8b-instruct",
      { input }
    )) {
      // pass generated text to variable
      generatedText += event;
    }

    // return response to client (index.js): send text string
    res.json({ text: generatedText });
  } catch (error) {
    console.error("Error generating text: ", error.message);
    res.status(500).json({ error: "Failed to generate text" });
  }
};


// I would suggest to also put a prompt with: prompt: `Create a short story based on the following prompt: "${prompt}". The story should be engaging, creative, and suitable for all ages.`,