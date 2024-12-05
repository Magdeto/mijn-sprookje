import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import apiRoutes from "./routes/apiRoutes.js";

const app = express();
const port = 3000;

app.use(express.json());

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// serve static files
app.use(express.static(path.join(__dirname, "public")));
app.get("/story", (req, res) => { res.sendFile(path.join(__dirname, "public", "storytelling.html")); });

// API routes
app.use("/api", apiRoutes);

app.listen(port, () => {
  console.log(`Example app running on http://localhost:${port}`);
});