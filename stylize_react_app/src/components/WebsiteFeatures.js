import React from "react";
import "./WebsiteFeatures.css"; // Create this file for styling

const WebsiteFeatures = () => {
  return (
    <section className="features">
      <h2>Website Features</h2>
      <div className="feature-list">
        <div className="feature">
          <h3>AI-Powered Art</h3>
          <p>Generate unique and stunning artwork with the power of AI.</p>
        </div>
        <div className="feature">
          <h3>Collaborative Platform</h3>
          <p>Connect with artists and developers to create innovative designs.</p>
        </div>
        <div className="feature">
          <h3>Easy-to-Use Tools</h3>
          <p>Simple and intuitive AI tools designed for all skill levels.</p>
        </div>
      </div>
    </section>
  );
};

export default WebsiteFeatures;
