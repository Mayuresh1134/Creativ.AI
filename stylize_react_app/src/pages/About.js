import React from "react";
import ContactForm from "../components/ContactForm";
import "../components/About.css";

const About = () => {
  return (
    <div className="about">
      <h2>About CreativeAI</h2>
      <p>
      Creativ.AI is a platform where artists and developers collaborate to create stunning artwork using AI.
      <p>With cutting-edge AI models, we empower creators to explore new artistic possibilities, generate unique visuals, and push the boundaries of digital art.</p>
      <p>Join our community of innovators and discover how AI can enhance creativity, making art more accessible and inspiring than ever before.</p>
      </p>
      <ContactForm />
    </div>
  );
};

export default About;
