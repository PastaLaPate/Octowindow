import bonjour, { Bonjour } from "bonjour-service"; // you must install this
import express from "express";
import { exec } from "child_process";
import fs from "fs";
import os from "os";
import path from "path";
import { fileURLToPath } from "url";

const app = express();

// Get absolute path to this script (because import.meta.url gives a file:// URL)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Resolve the path to ../frontend relative to backend
const frontendPath = path.resolve(__dirname, "../frontend");
const isProd = fs.existsSync(path.join(frontendPath, "index.html"));

console.log(`[+] Running in ${isProd ? "PRODUCTION" : "DEVELOPMENT"} mode`);
const port = isProd ? 3000 : 3001;

// If prod serve the frontend
if (isProd) {
  console.log(`Serving frontend from: ${frontendPath}`);
  app.use(express.static(frontendPath));
  app.get(/(.*)/, (req, res) => {
    res.sendFile(path.join(frontendPath, "index.html"));
  });
}

// API

// Health check
app.get("/api/ping", (req, res) => {
  res.json({ message: "pong", hostname: os.hostname() });
});

app.post("/api/shutdown", (req, res) => {
  res.json({ message: "Shutting down..." });
  exec("shutdown now", (error, stdout, stderr) => {
    if (error) {
      res.status(500).json({ error: `Shutdown failed: ${error.message}` });
      console.error(`Error shutting down: ${error.message}`);
      return;
    }
    if (stderr) {
      console.error(`Shutdown stderr: ${stderr}`);
    }
    console.log(`Shutdown stdout: ${stdout}`);
  });
});

app.get("/api/bonjour", (req, res) => {
  const bonjourService = new Bonjour();
  const services = [];

  const browser = bonjourService.find(
    {
      type: "octoprint",
    },
    (service) => {
      services.push(service);
    },
  );

  setTimeout(() => {
    browser.stop();
    bonjourService.destroy();
    res.json({ services });
  }, 1000);
});

app.listen(port, () => {
  console.log(`✅ Server running at http://localhost:${port}`);
});
