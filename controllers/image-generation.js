import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import { writeFile } from "node:fs/promises";
import Replicate from "replicate";
import dotenv from "dotenv";

dotenv.config();
const replicate = new Replicate({ auth: process.env.REPLICATE_API_TOKEN })

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const generateImage = async (req, res) => {
  try {
    // prompts received from client (index.js)
    const prompts = req.body.prompts;

    // checks if prompts returns an array
    // console.log(prompts);

    // array holding file paths of generated images
    const filePaths = [];

    // iterate through array of prompts
    for (const [index, prompt] of prompts.entries()) {
      const input = { prompt, aspect_ratio: "3:2" };

      // run image generating model with Replicate's API
      const output = await replicate.run("black-forest-labs/flux-schnell", {
        input,
      });

      // save each generated image
      for (const [subIndex, item] of output.entries()) {
        const filePath = path.join(
          __dirname,
          "../public/assets/generated-images",
          `/output_${index}_${subIndex}.webp`
        );
        await writeFile(filePath, item);
        filePaths.push(`/output_${index}_${subIndex}.webp`);
      }
    }

    // return response to client (index.js): send array of generated images
    res.json({ images: filePaths });
  } catch (error) {
    console.error("Error generating image:", error.message);
    res.status(500).json({ error: "Failed to generate image" });
  }
};
