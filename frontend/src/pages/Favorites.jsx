import React from 'react'
import Navbar from '../components/Navbar'
import { useImportance } from "../components/Context";
const Favorites = () => {
  const { importantItems } = useImportance();
  return (
    <div>
      <Navbar />
      <div className="container p-4">
        <h2 className="mb-4">⭐ Important Summaries</h2>
        {importantItems.length === 0 ? (
          <p>No important items yet.</p>
        ) : (
          importantItems.map((item, index) => (
            <div key={index} className="card p-3 mb-3">
              <h5>{item.filename}</h5>
              <pre style={{ whiteSpace: "pre-wrap" }}>{item.summary}</pre>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default Favorites