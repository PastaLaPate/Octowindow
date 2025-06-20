import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
const port = 3000;

// Get absolute path to this script (because import.meta.url gives a file:// URL)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Resolve the path to ../frontend relative to backend
const frontendPath = path.resolve(__dirname, "../frontend");

console.log(`Serving frontend from: ${frontendPath}`);
app.use(express.static(frontendPath));

// Optional: fallback to index.html for SPA routing
app.get("*", (req, res) => {
  res.sendFile(path.join(frontendPath, "index.html"));
});

app.listen(port, () => {
  console.log(`✅ Server running at http://localhost:${port}`);
});
