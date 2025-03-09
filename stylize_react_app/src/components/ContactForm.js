import React, { useState } from "react";
import "./About.css";

const ContactForm = () => {
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    alert(`Thank you, ${name}! Your message has been received.`);
  };

  return (
    <form className="contact-form" onSubmit={handleSubmit}>
      <label>Name:</label>
      <input type="text" value={name} onChange={(e) => setName(e.target.value)} />
      <label>Message:</label>
      <textarea value={message} onChange={(e) => setMessage(e.target.value)} />
      <button type="submit">Submit</button>
    </form>
  );
};

export default ContactForm;
