const express = require("express");
const cors = require("cors");
const multer = require("multer");
const pdfParse = require("pdf-parse");
const mammoth = require("mammoth"); // For .docx

const app = express();
app.use(cors());

const upload = multer({ storage: multer.memoryStorage() });

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
      mimetype ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
      extension === "docx"
    ) {
      const result = await mammoth.extractRawText({ buffer });
      text = result.value;
    } else {
      return res.status(415).json({ error: "Unsupported file type" });
    }

    console.log(`🧾 Extracted text (${originalname}):\n`, text.slice(0, 300));

    res.json({
      filename: originalname,
      text,
      message: "File processed successfully",
    });
  } catch (err) {
    console.error("Error processing file:", err);
    res.status(500).json({ error: "Failed to process the file" });
  }
});

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
