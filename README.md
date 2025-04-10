# 📄 Text Summarizer + Mind Map Generator 🧠

A lightweight full-stack web app that allows users to upload documents (PDF, DOCX, TXT), get a summarized version of the content using LLMs, and visualize it as a mind map. Users can mark summaries as ⭐ important and view them later — no database required.

---

## 🚀 Features

- 📁 Upload PDF, DOCX, and TXT files
- ✨ AI-generated summary using Groq API (LLaMA 3)
- 🧠 Interactive mind map visualization with `react-d3-tree`
- ⭐ Mark as important (stored using React Context/local state)
- 🔐 Simple login (no backend authentication, no database)
- 🧼 Clean Bootstrap 5-based responsive UI

---

## 🧑‍💻 Tech Stack

| Frontend           | Backend             | AI/LLM       |
|--------------------|---------------------|--------------|
| React, Bootstrap 5 | Express.js, Multer  | Groq (LLaMA 3) |

---

## 📦 Installation

```bash
git clone https://github.com/your-username/text-summarizer.git
cd text-summarizer
```
## 📁 Folder Structure

text-summarizer/ ├── backend/ │ ├── index.js │ ├── routes/ │ └── controllers/ │ └── frontend/ ├── public/ ├── src/ │ ├── components/ │ ├── pages/ │ ├── Context/ │ └── App.jsx └── vite.config.js

