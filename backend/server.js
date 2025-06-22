import { Bonjour } from "bonjour-service"; // you must install this

import cors from "cors";
import express from "express";
import fetch from "node-fetch";
import { exec, spawn } from "child_process";
import fs from "fs";
import os from "os";
import path from "path";
import { fileURLToPath } from "url";
import util from "util";

// Get absolute path to this script (because import.meta.url gives a file:// URL)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

var log_file = fs.createWriteStream(__dirname + "/server.log", { flags: "w" });
var log_stdout = process.stdout;

console.log = function (d) {
  //
  log_file.write(util.format(d) + "\n");
  log_stdout.write(util.format(d) + "\n");
};

// Read version.json using fs since require is not available in ES modules
let version = "";
let versionFilePath = path.join(__dirname, "version.json");
if (fs.existsSync(versionFilePath)) {
  try {
    const versionFile = JSON.parse(fs.readFileSync(versionFilePath, "utf-8"));
    version = versionFile && versionFile.version ? versionFile.version : "dev";
  } catch (e) {
    version = "dev";
  }
} else {
  version = "dev";
}

const app = express();

const allowedOrigins = [
  "http://localhost",
  "http://localhost:3000",
  "http://127.0.0.1",
  "http://127.0.0.1:3000",
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (e.g., curl, same-origin)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error("Not allowed by CORS"));
    },
  }),
);

// Resolve the path to ../frontend relative to backend
const frontendPath = path.resolve(__dirname, "../frontend");
const isProd = fs.existsSync(path.join(frontendPath, "index.html"));

console.log(`[+] Running in ${isProd ? "PRODUCTION" : "DEVELOPMENT"} mode`);
const port = isProd ? 3000 : 3001;

// If prod serve the frontend
if (isProd) {
  console.log(`Serving frontend from: ${frontendPath}`);
  app.use(express.static(frontendPath));
  app.get(/^\/(?!api\/).*/, (req, res) => {
    res.sendFile(path.join(frontendPath, "index.html"));
  });
}

// API

// Health check
app.get("/api/ping", (req, res) => {
  res.json({ message: "pong", hostname: os.hostname(), version: version });
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

const OCTOWINDOW_ROOT = path.resolve(__dirname, ".."); // one level up from backend
const UPDATE_SCRIPT_URL =
  "https://raw.githubusercontent.com/PastaLaPate/Octowindow/master/scripts/update.sh";

app.post("/api/update", async (req, res) => {
  try {
    // 1. Download latest update.sh content
    const response = await fetch(UPDATE_SCRIPT_URL);
    if (!response.ok)
      throw new Error(`Failed to fetch update script: ${response.statusText}`);

    const scriptContent = await response.text();

    // 2. Write it to octowindow/update.sh
    const updateScriptPath = path.join(OCTOWINDOW_ROOT, "update.sh");
    await fs.promises.writeFile(updateScriptPath, scriptContent, {
      mode: 0o755,
    });

    // 3. Execute it with sudo (pass install path if needed)
    spawn(
      "bash",
      [
        "-c",
        `${updateScriptPath} ${OCTOWINDOW_ROOT} > ~/octowindow-update.log 2>&1`,
      ],
      {
        stdio: "ignore",
        detached: true,
      },
    ).unref();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.listen(port, () => {
  console.log(`✅ Server running at http://localhost:${port}`);
});
