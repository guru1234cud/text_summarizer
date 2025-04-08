const express = require("express");
const cors = require("cors");
const multer = require("multer");
const pdfParse = require("pdf-parse");
const mammoth = require("mammoth"); // For .docx
const axios = require('axios')
const app = express();
app.use(cors());

const upload = multer({ storage: multer.memoryStorage() });

async function summarizeWithHuggingFace(text) {
  const MAX_CHARS = 3000;
  const safeText = text.slice(0, MAX_CHARS);

  try {
    const response = await axios.post(
      "https://api-inference.huggingface.co/models/facebook/bart-large-cnn",
      { inputs: safeText },
      {
        headers: {
          Authorization: "Bearer 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", // optional if using public access
        },
      }
    );

    if (Array.isArray(response.data)) {
      return response.data[0].summary_text;
    } else {
      return "⚠️ HuggingFace response error: No summary found.";
    }
  } catch (err) {
    console.error("HuggingFace error:", err?.response?.data || err.message);
    return "⚠️ Failed to summarize using HuggingFace.";
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

    // ✅ Summarize with DeepSeek
    const summary = await summarizeWithHuggingFace(text);

    // ✅ Final Response
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
