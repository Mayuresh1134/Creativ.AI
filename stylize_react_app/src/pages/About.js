import React from "react";
import ContactForm from "../components/ContactForm";

const credits = [
  { tool: "Style transfer", model: "Magenta arbitrary image stylization", license: "Apache 2.0" },
  { tool: "Cartoonize, classic", model: "OpenCV filters", license: "Apache 2.0" },
  { tool: "Cartoonize, anime", model: "AnimeGANv2 (Shinkai)", license: "Non-commercial use only" },
  { tool: "Remove background", model: "rembg with U²-Net", license: "MIT / Apache 2.0" },
  { tool: "Upscale", model: "FSRCNN and EDSR", license: "Apache 2.0" },
  { tool: "Sketch and paint", model: "OpenCV filters", license: "Apache 2.0" },
  { tool: "Colorize", model: "Colorful Image Colorization (Zhang et al.)", license: "BSD 2-Clause" },
];

const About = () => {
  return (
    <div className="about">
      <section className="about-text">
        <h1>About Creativ.AI</h1>
        <p>
          Creativ.AI is a platform where artists and developers collaborate to create stunning
          artwork using AI.
        </p>
        <p>
          With cutting-edge AI models, we empower creators to explore new artistic possibilities,
          generate unique visuals, and push the boundaries of digital art.
        </p>
        <p>
          Join our community of innovators and discover how AI can enhance creativity, making art
          more accessible and inspiring than ever before.
        </p>

        <h2>Models behind the tools</h2>
        <div className="table-scroll">
          <table className="credits">
            <thead>
              <tr>
                <th scope="col">Tool</th>
                <th scope="col">Model</th>
                <th scope="col">Licence</th>
              </tr>
            </thead>
            <tbody>
              {credits.map((row) => (
                <tr key={row.tool}>
                  <th scope="row">{row.tool}</th>
                  <td>{row.model}</td>
                  <td>{row.license}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="about-contact" aria-labelledby="contact-heading">
        <h2 id="contact-heading">Get in touch</h2>
        <ContactForm />
      </section>
    </div>
  );
};

export default About;
