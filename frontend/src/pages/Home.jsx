import React, { useState } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";

const HomePage = () => {
    
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [responseMsg, setResponseMsg] = useState("");

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setResponseMsg("");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await axios.post("http://localhost:5000/api/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setResponseMsg(`✅ ${res.data.message}`);
    } catch (err) {
      console.error(err);
      setResponseMsg("❌ Upload failed.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <>
    <Navbar />
    <div className="container d-flex align-items-center justify-content-center min-vh-100">
      <div className="card shadow p-4 w-100" style={{ maxWidth: "600px" }}>
        <h1 className="text-center text-primary mb-4">Summarize It Now</h1>

        <form>
          <div className="mb-3">
            <label htmlFor="formFile" className="form-label">
              Select a file to summarize (PDF/TXT)
            </label>
            <input
              className="form-control"
              type="file"
              id="formFile"
              accept=".pdf,.txt"
              onChange={handleFileChange}
              />
          </div>

          <div className="text-center">
            <button
              type="button"
              className="btn btn-primary"
              disabled={!file || uploading}
              onClick={handleUpload}
              >
              {uploading ? "Uploading..." : "Upload & Summarize"}
            </button>
          </div>

          {responseMsg && (
              <div className="alert alert-info text-center mt-3">{responseMsg}</div>
            )}
        </form>
      </div>
    </div>
            </>
  );
};

export default HomePage;
