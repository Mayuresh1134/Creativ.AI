import React, { useEffect, useRef, useState } from "react";
import { ImagePlus } from "lucide-react";

// A click-or-drop target for one image. Shows the chosen image inside itself.
const Dropzone = ({ label, hint, file, onFile }) => {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const [preview, setPreview] = useState(null);

  useEffect(() => {
    if (!file) {
      setPreview(null);
      return undefined;
    }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const pick = (fileList) => {
    const picked = fileList && fileList[0];
    if (picked && picked.type.startsWith("image/")) onFile(picked);
  };

  return (
    <div className="dropzone-field">
      <span className="field-label">{label}</span>
      <button
        type="button"
        className={`dropzone ${dragging ? "dropzone-dragging" : ""} ${preview ? "dropzone-filled" : ""}`}
        onClick={() => inputRef.current.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          pick(e.dataTransfer.files);
        }}
      >
        {preview ? (
          <>
            <img src={preview} alt={`${label} preview`} />
            <span className="dropzone-replace">Replace image</span>
          </>
        ) : (
          <span className="dropzone-empty">
            <ImagePlus aria-hidden="true" size={28} />
            <span className="dropzone-title">Drop an image here, or choose a file</span>
            <span className="dropzone-hint">{hint || "JPG, PNG or WebP, up to 16 MB"}</span>
          </span>
        )}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/bmp"
        hidden
        onChange={(e) => {
          pick(e.target.files);
          e.target.value = "";
        }}
      />
    </div>
  );
};

export default Dropzone;
