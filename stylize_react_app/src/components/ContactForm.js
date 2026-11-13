import React, { useState } from "react";

const ContactForm = () => {
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSent(true);
  };

  if (sent) {
    return (
      <p className="notice" role="status">
        Thank you{name ? `, ${name}` : ""}! Your message has been received.
      </p>
    );
  }

  return (
    <form className="contact-form" onSubmit={handleSubmit}>
      <label htmlFor="contact-name">Name</label>
      <input id="contact-name" type="text" value={name} onChange={(e) => setName(e.target.value)} />
      <label htmlFor="contact-message">Message</label>
      <textarea
        id="contact-message"
        rows={5}
        required
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />
      <button type="submit" className="button">Send message</button>
    </form>
  );
};

export default ContactForm;
