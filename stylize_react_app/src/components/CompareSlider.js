import React, { useState } from "react";

// Two images stacked on top of each other with a draggable divider.
// The left part shows `before`, the right part shows `after`.
const CompareSlider = ({ before, after, beforeLabel = "Before", afterLabel = "After", checkered = false }) => {
  const [position, setPosition] = useState(50);

  return (
    <div className={`compare ${checkered ? "compare-checkered" : ""}`} style={{ "--position": `${position}%` }}>
      <img src={after} alt={afterLabel} className="compare-img compare-after" draggable="false" />
      <img src={before} alt={beforeLabel} className="compare-img compare-before" draggable="false" />
      <span className="compare-tag compare-tag-before">{beforeLabel}</span>
      <span className="compare-tag compare-tag-after">{afterLabel}</span>
      <div className="compare-divider" aria-hidden="true">
        <span className="compare-handle" />
      </div>
      <input
        type="range"
        min="0"
        max="100"
        value={position}
        onChange={(e) => setPosition(Number(e.target.value))}
        className="compare-range"
        aria-label={`Drag to compare ${beforeLabel.toLowerCase()} and ${afterLabel.toLowerCase()}`}
      />
    </div>
  );
};

export default CompareSlider;
