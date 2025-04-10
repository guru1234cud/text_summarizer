// 📁 Home.jsx (Light Theme with Bootstrap 5)

import React, { useState } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";
import Tree from "react-d3-tree";
import { useImportance } from "../components/Context";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [responseMsg, setResponseMsg] = useState("");
  const [summary, setSummary] = useState("");
  const [mindMap, setMindMap] = useState(null);
  const { addToImportant } = useImportance();
  const navigate = useNavigate();
  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setSummary("");
    setMindMap(null);
    setResponseMsg("");
  };

  const handleMarkImportant = (e) => {
    e.preventDefault();
    addToImportant({ filename: file?.name || "Untitled", summary });
    navigate("/favorites");
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setResponseMsg("");
    setSummary("");
    setMindMap(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await axios.post("http://localhost:5000/api/upload", formData, {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" },
      });

      setResponseMsg(`✅ ${res.data.message || "Upload successful"}`);
      setSummary(res.data.summary || "");
      setMindMap(res.data.mind_map || {});
    } catch (err) {
      console.error(err);
      setResponseMsg("❌ Upload failed.");
    } finally {
      setUploading(false);
    }
  };

  const convertToTree = (obj, rootName = "Mind Map") => {
    const buildChildren = (node) => {
      if (Array.isArray(node)) {
        return node.map((item) => ({ name: item }));
      } else if (typeof node === "object") {
        return Object.entries(node).map(([key, value]) => ({
          name: key,
          children: buildChildren(value),
        }));
      } else {
        return [{ name: String(node) }];
      }
    };

    return {
      name: rootName,
      children: buildChildren(obj),
    };
  };

  return (
    <>
      <Navbar />
      <div className="container-fluid bg-light text-dark min-vh-100 p-4">
        <div className="card bg-white shadow-lg p-4 mx-auto text-dark" style={{ maxWidth: "800px" }}>
          <h1 className="text-center text-primary mb-4">Summarize It Now</h1>

          <form>
            <div className="mb-3">
              <label htmlFor="formFile" className="form-label">
                Select a file to summarize (PDF/TXT/DOCX)
              </label>
              <input
                className="form-control border-primary"
                type="file"
                id="formFile"
                accept=".pdf,.txt,.docx"
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
              <div className="alert alert-light text-center mt-3 border border-primary">{responseMsg}</div>
            )}

            {summary && (
              <div className="alert alert-secondary border mt-3" style={{ whiteSpace: "pre-wrap" }}>
                <h5>📄 Summary:</h5>
                {summary}
              </div>
            )}

            {summary && (
              <div className="text-center mt-2">
                <button className="btn btn-warning" onClick={handleMarkImportant}>
                  ⭐ Mark as Important
                </button>
              </div>
            )}

            {mindMap && Object.keys(mindMap).length > 0 && (
              <div className="mt-4">
                <h5 className="text-success">🧠 Mind Map:</h5>
                <div
                  id="mind-map-container"
                  style={{
                    width: "100%",
                    height: "85vh",
                    overflow: "scroll",
                    border: "1px solid #ccc",
                    borderRadius: "12px",
                    background: "#f5f5f5",
                    padding: "10px",
                  }}
                >
                  <Tree
                    data={convertToTree(mindMap)}
                    orientation="vertical"
                    translate={{ x: 600, y: 100 }}
                    separation={{ siblings: 2, nonSiblings: 2.5 }}
                    nodeSize={{ x: 250, y: 120 }}
                    pathFunc="elbow"
                    zoomable
                  />
                </div>
              </div>
            )}
          </form>
        </div>
      </div>
    </>
  );
};

export default Home;