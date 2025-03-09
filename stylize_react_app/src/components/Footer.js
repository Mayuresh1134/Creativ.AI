import React from "react";
import "./Footer.css";
import { FaFacebook, FaTwitter, FaInstagram, FaGithub } from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <h3>Creativ.AI</h3>
        <p>Unleash your creativity with the power of AI.</p>
        <div className="social-icons">
          <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="facebook">
            <FaFacebook />
          </a>
          <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="twitter">
            <FaTwitter />
          </a>
          <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="instagram">
            <FaInstagram />
          </a>
          <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="github">
            <FaGithub />
          </a>
        </div>
      </div>
      <p className="footer-bottom">
        &copy; {new Date().getFullYear()} Creativ.AI | All Rights Reserved
      </p>
    </footer>
  );
};

export default Footer;
