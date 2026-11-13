import React from "react";
import { FaGithub } from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <p>
          <strong>Creativ.AI</strong> &copy; {new Date().getFullYear()}. Built with React, Flask and
          open-source models.
        </p>
        <a
          href="https://github.com/Mayuresh1134/Creativ.AI"
          target="_blank"
          rel="noopener noreferrer"
          className="footer-link"
        >
          <FaGithub aria-hidden="true" /> Source on GitHub
        </a>
      </div>
    </footer>
  );
};

export default Footer;
