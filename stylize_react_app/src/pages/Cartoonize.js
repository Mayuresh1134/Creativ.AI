import React, { useState } from "react";
import UploadField from "../components/UploadField";
import "../components/StyleTransfer.css";

const Cartoonize = () => {
  const [inputImage, setInputImage] = useState(null);
  const [inputFile, setInputFile] = useState(null);
  const [outputImage, setOutputImage] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleCartoonize = async () => {
    if (!inputFile) {
      alert("Please upload an image!");
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append("content", inputFile);

    try {
      const response = await fetch("http://127.0.0.1:5000/cartoonize", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setOutputImage(`http://127.0.0.1:5000/static/results/${data.result_img}?t=${new Date().getTime()}`);
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
    <div className="cartoonize">
      <h2 className="title">Cartoonize Your Image</h2>

      <div className="upload-section">
        <UploadField label="Upload Image" setImage={setInputImage} setFile={setInputFile} />
      </div>

      <div className="preview-section">
        {inputImage && <img src={inputImage} alt="Input" className="preview-img" />}
      </div>

      {inputImage && (
        <button className="convert-btn" onClick={handleCartoonize} disabled={loading}>
          {loading ? "Processing..." : "Cartoonize"}
        </button>
      )}

      {loading && <p className="loading-text">Applying cartoon effect...</p>}

      {outputImage && (
        <div className="output-section">
          <h3>Cartoonized Output</h3>
          <img src={outputImage} alt="Cartoonized Output" className="output-img" />
        </div>
      )}
    </div>
  );
};

export default Cartoonize;
