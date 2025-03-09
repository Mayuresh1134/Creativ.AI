import React, { useState } from "react";
import UploadField from "../components/UploadField";
import "../components/StyleTransfer.css";

const StyleTransfer = () => {
  const [contentImage, setContentImage] = useState(null);
  const [styleImage, setStyleImage] = useState(null);
  const [contentFile, setContentFile] = useState(null);
  const [styleFile, setStyleFile] = useState(null);
  const [outputImage, setOutputImage] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleConvert = async () => {
    if (!contentFile || !styleFile) {
      alert("Please upload both images!");
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append("content", contentFile);
    formData.append("style", styleFile);

    try {
      const response = await fetch("http://127.0.0.1:5000/stylize", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setOutputImage(`http://127.0.0.1:5000/static/results/${data.result_img}`);
      } else {
        alert("Error processing the image.");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("An error occurred. Please try again.");
    }

    setLoading(false);
  };

  return (
    <div className="style-transfer">
      <h2 className="title">AI Style Transfer</h2>

      <div className="upload-section">
        <UploadField label="Upload Content Image" setImage={setContentImage} setFile={setContentFile} />
        <UploadField label="Upload Style Image" setImage={setStyleImage} setFile={setStyleFile} />
      </div>

      <div className="preview-section">
        {contentImage && <img src={contentImage} alt="Content" className="preview-img" />}
        {styleImage && <img src={styleImage} alt="Style" className="preview-img" />}
      </div>

      {contentImage && styleImage && (
        <button className="convert-btn" onClick={handleConvert} disabled={loading}>
          {loading ? "Processing..." : "Convert"}
        </button>
      )}

      {loading && <p className="loading-text">Applying style transfer...</p>}

      {outputImage && (
        <div className="output-section">
          <h3>Stylized Output</h3>
          <img src={outputImage} alt="Stylized Output" className="output-img" />

          
        </div>
      )}
    </div>
  );
};

export default StyleTransfer;
