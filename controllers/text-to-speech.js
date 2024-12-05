import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import Replicate from "replicate";
import dotenv from "dotenv";
import { writeFile } from "node:fs/promises";

dotenv.config();
const replicate = new Replicate({ auth: process.env.REPLICATE_API_TOKEN });

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const generateSpeech = async (req, res) => {
  try {
    // prompt received from client (index.js)
    const prompt = req.body.prompt;

    console.log(prompt);

    const input = {
      text: prompt,
      language: "nl",
      speaker:
        "https://replicate.delivery/pbxt/Jt79w0xsT64R1JsiJ0LQRL8UcWspg5J4RFrU6YwEKpOT1ukS/male.wav",
    };

    // run speech generation model with Replicate's API
    const output = await replicate.run(
      "lucataco/xtts-v2:684bc3855b37866c0c65add2ff39c78f3dea3f4ff103a436465326e0f438d55e",
      { input }
    );

    const filePath = path.join(
      __dirname,
      "../public/assets/generated-speech",
      `/output.wav`
    );
    await writeFile(filePath, output);

    // return response to client (index.js): send audio file path
    res.json({ audio: `output.wav` });
  } catch (error) {
    console.error("Error generating text: ", error.message);
    res.status(500).json({ error: "Failed to generate text" });
  }
};
