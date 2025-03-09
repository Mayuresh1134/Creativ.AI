import React, { useState, useEffect } from "react";
import "./ImageSlider.css";

import image1 from "../static/images/first.jpeg";
import image2 from "../static/images/second.jpeg";
import image3 from "../static/images/third.jpeg";

const images = [image1, image2, image3];

const ImageSlider = () => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="slider-container">
      <img src={images[index]} alt="Creative Artwork" className="slider-image" />
      <div className="dots-container">
        {images.map((_, i) => (
          <span
            key={i}
            className={`dot ${index === i ? "active-dot" : ""}`}
          ></span>
        ))}
      </div>
    </div>
  );
};

export default ImageSlider;
