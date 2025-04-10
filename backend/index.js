// ✅ Backend with DB for storing marked important summaries

require("dotenv").config();
const express = require("express");
const cors = require("cors");
const multer = require("multer");
const pdfParse = require("pdf-parse");
const mammoth = require("mammoth");
const axios = require("axios");
const mongoose = require("mongoose");

const app = express();

// Connect to MongoDB
mongoose.connect("mongodb://127.0.0.1:27017/summarizer", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// MongoDB Models
const importantSchema = new mongoose.Schema({
  userEmail: String,
  filename: String,
  summary: String,
  createdAt: { type: Date, default: Date.now },
});
const Important = mongoose.model("Important", importantSchema);

app.use(cors({
  origin: ["http://localhost:5173", "http://localhost:5174"],
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const upload = multer({ storage: multer.memoryStorage() });

// Groq: Generate Summary
async function generateSummary(text) {
  try {
    const response = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: "llama3-70b-8192",
        messages: [
          {
            role: "system",
            content: "You are a helpful assistant that summarizes text. Return only the summary in plain text.",
          },
          {
            role: "user",
            content: `Summarize the following:\n\n"""${text}"""`,
          },
        ],
        temperature: 0.5,
      },
      {
        headers: {
          Authorization: `Bearer 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`,
          "Content-Type": "application/json",
        },
      }
    );
    return response.data.choices[0].message.content.trim();
  } catch (err) {
    console.error("Groq Summary Error:", err.response?.data || err.message);
    return "⚠️ Failed to generate summary.";
  }
}

// Groq: Generate Mind Map
async function generateMindMap(text) {
  try {
    const response = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: "llama3-70b-8192",
        messages: [
          {
            role: "system",
            content: "You are an assistant that creates mind maps in JSON format. Do not include markdown or explanation.",
          },
          {
            role: "user",
            content: `Create a mind map for the following content in JSON format:\n{\n  \"Root Topic\": {\n    \"Subtopic 1\": [\"Point A\", \"Point B\"],\n    \"Subtopic 2\": [\"Point C\"]\n  }\n}\nText:\n\"\"\"${text}\"\""`,
          },
        ],
        temperature: 0.5,
      },
      {
        headers: {
          Authorization: `Bearer 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`,
          "Content-Type": "application/json",
        },
      }
    );

    const raw = response.data.choices[0].message.content;
    const parsed = JSON.parse(raw);
    return parsed;
  } catch (err) {
    console.error("Groq Mind Map Error:", err.response?.data || err.message);
    return {};
  }
}

// Upload and Process File
app.post("/api/upload", upload.single("file"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  const { originalname, mimetype, buffer } = req.file;
  const extension = originalname.split(".").pop().toLowerCase();

  try {
    let text = "";

    if (mimetype === "application/pdf" || extension === "pdf") {
      const data = await pdfParse(buffer);
      text = data.text;
    } else if (mimetype === "text/plain" || extension === "txt") {
      text = buffer.toString("utf-8");
    } else if (
      mimetype === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
      extension === "docx"
    ) {
      const result = await mammoth.extractRawText({ buffer });
      text = result.value;
    } else {
      return res.status(415).json({ error: "Unsupported file type" });
    }

    const summary = await generateSummary(text);
    const mind_map = await generateMindMap(text);

    res.json({
      filename: originalname,
      summary,
      mind_map,
      message: "File processed and summarized successfully",
    });
  } catch (err) {
    console.error("File Processing Error:", err);
    res.status(500).json({ error: "Failed to process the file" });
  }
});

// Mark summary as important
app.post("/api/mark-important", async (req, res) => {
  const { userEmail, filename, summary } = req.body;

  if (!userEmail || !filename || !summary) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    await Important.create({ userEmail, filename, summary });
    res.json({ message: "Marked as important!" });
  } catch (err) {
    console.error("Error saving importance:", err);
    res.status(500).json({ error: "Failed to mark as important" });
  }
});

// Fetch all important summaries for a user
app.get("/api/important/:userEmail", async (req, res) => {
  const { userEmail } = req.params;
  try {
    const data = await Important.find({ userEmail }).sort({ createdAt: -1 });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch important summaries" });
  }
});

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
