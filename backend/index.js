require("dotenv").config();
const express = require("express");
const cors = require("cors");
const multer = require("multer");
const pdfParse = require("pdf-parse");
const mammoth = require("mammoth"); 
const axios = require('axios');
const app = express();
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));
const upload = multer({ storage: multer.memoryStorage() });

app.use(express.json());
app.use(express.urlencoded({ extended: true }));



async function summarizeWithCohere(text) {
  try {
    const response = await axios.post(
      "https://api.cohere.ai/v1/summarize",
      {
        text: text,
        length: "medium", 
        format: "paragraph", 
        model: "command",
      },
      {
        headers: {
          "Authorization": `Bearer ${process.env.COHERE_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    return response.data.summary || "⚠️ No summary returned.";
  } catch (err) {
    console.error("Cohere API error:", err.response?.data || err.message);
    return "⚠️ Failed to summarize using Cohere.";
  }
}

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

    console.log(`🧾 Extracted text (${originalname}):\n`, text.slice(0, 300));

    const summary = await summarizeWithCohere(text);
    console.log(" Received file:", req);
    console.log(res.summary);
     
    res.json({
      filename: originalname,
      text,
      summary,
      message: "File processed and summarized successfully",
    });
  } catch (err) {
    console.error("Error processing file:", err);
    res.status(500).json({ error: "Failed to process the file" });
  }
});

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
