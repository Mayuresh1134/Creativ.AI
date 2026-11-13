import React, { useState } from "react";
import { Link } from "react-router-dom";
import CompareSlider from "../components/CompareSlider";
import tools from "../tools";
import original from "../assets/demo/original.jpg";
import anime from "../assets/demo/anime.jpg";
import pencil from "../assets/demo/pencil.jpg";
import watercolor from "../assets/demo/watercolor.jpg";
import blur from "../assets/demo/blur.jpg";

// Real outputs of the tools, made from one sample photo.
const demos = [
  { label: "Anime", image: anime },
  { label: "Pencil", image: pencil },
  { label: "Watercolour", image: watercolor },
  { label: "Background blur", image: blur },
];

const Home = () => {
  const [demo, setDemo] = useState(demos[0]);

  return (
    <div className="home">
      <section className="hero">
        <div className="hero-copy">
          <h1>Turn any photo into a painting, a sketch or a cartoon</h1>
          <p>
            Creativ.AI is a small studio of open-source image models. Upload a picture, pick a tool
            and download the result.
          </p>
          <Link to={tools[0].path} className="button button-large">
            Open the studio
          </Link>
        </div>

        <div className="hero-demo">
          <CompareSlider before={original} after={demo.image} beforeLabel="Photo" afterLabel={demo.label} />
          <div className="segmented" role="group" aria-label="Choose an effect to preview">
            {demos.map((item) => (
              <button
                key={item.label}
                type="button"
                className={`segment-button ${item === demo ? "segment-button-active" : ""}`}
                aria-pressed={item === demo}
                onClick={() => setDemo(item)}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="tool-index" aria-labelledby="tools-heading">
        <h2 id="tools-heading">Six tools</h2>
        <ul className="tool-list">
          {tools.map((tool) => (
            <li key={tool.id}>
              <Link to={tool.path} className="tool-row">
                <tool.icon size={22} aria-hidden="true" />
                <span className="tool-row-name">{tool.name}</span>
                <span className="tool-row-blurb">{tool.blurb}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="privacy" aria-labelledby="privacy-heading">
        <h2 id="privacy-heading">Your images stay on your server</h2>
        <p>
          Every tool runs on the Flask backend you start yourself. Uploads are deleted as soon as
          they are processed, and results are removed after an hour.
        </p>
      </section>
    </div>
  );
};

export default Home;
