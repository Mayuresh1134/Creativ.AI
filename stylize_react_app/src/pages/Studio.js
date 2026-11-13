import React, { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { Download, LoaderCircle } from "lucide-react";
import CompareSlider from "../components/CompareSlider";
import Dropzone from "../components/Dropzone";
import { runTool } from "../api";
import tools from "../tools";

const defaultOptions = (tool) =>
  Object.fromEntries((tool.options || []).map((option) => [option.name, option.choices[0].value]));

const Workspace = ({ tool }) => {
  const [files, setFiles] = useState({});
  const [options, setOptions] = useState(() => defaultOptions(tool));
  const [status, setStatus] = useState("idle"); // idle | working | done | error
  const [error, setError] = useState("");
  const [result, setResult] = useState(null); // { url, before, transparent }

  // Object URL of the main input, kept for the before/after comparison.
  const [beforeUrl, setBeforeUrl] = useState(null);
  useEffect(() => {
    if (!files.content) return undefined;
    const url = URL.createObjectURL(files.content);
    setBeforeUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [files.content]);

  const ready = tool.inputs.every((input) => files[input.name]);

  const handleRun = async () => {
    setStatus("working");
    setError("");
    try {
      const url = await runTool(tool.endpoint, files, options);
      setResult({ url, before: beforeUrl, transparent: options.background === "transparent" });
      setStatus("done");
    } catch (err) {
      setError(err.message);
      setStatus("error");
    }
  };

  const handleDownload = async () => {
    const blob = await (await fetch(result.url)).blob();
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `creativ-ai-${tool.id}.png`;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  return (
    <section className="workspace">
      <header className="workspace-header">
        <h1>{tool.name}</h1>
        <p>{tool.blurb}</p>
      </header>

      <div className={`inputs inputs-${tool.inputs.length}`}>
        {tool.inputs.map((input) => (
          <Dropzone
            key={input.name}
            label={input.label}
            hint={input.hint}
            file={files[input.name]}
            onFile={(file) => {
              setFiles((current) => ({ ...current, [input.name]: file }));
              setResult(null);
              setStatus("idle");
            }}
          />
        ))}
      </div>

      {(tool.options || []).map((option) => {
        const selected = option.choices.find((choice) => choice.value === options[option.name]);
        return (
          <fieldset key={option.name} className="option">
            <legend className="field-label">{option.label}</legend>
            <div className="segmented">
              {option.choices.map((choice) => (
                <label key={choice.value} className="segment">
                  <input
                    type="radio"
                    name={`${tool.id}-${option.name}`}
                    value={choice.value}
                    checked={options[option.name] === choice.value}
                    onChange={() => setOptions((current) => ({ ...current, [option.name]: choice.value }))}
                  />
                  <span>{choice.label}</span>
                </label>
              ))}
            </div>
            {selected && selected.hint && <p className="option-hint">{selected.hint}</p>}
          </fieldset>
        );
      })}

      <div className="run-row">
        <button type="button" className="button" onClick={handleRun} disabled={!ready || status === "working"}>
          {status === "working" ? (
            <>
              <LoaderCircle className="spin" size={18} aria-hidden="true" /> {tool.working}…
            </>
          ) : (
            tool.action
          )}
        </button>
        {!ready && (
          <span className="run-hint">
            {tool.inputs.length > 1 ? "Add both images to continue." : "Add an image to continue."}
          </span>
        )}
        {ready && tool.note && status !== "done" && <span className="run-hint">{tool.note}</span>}
      </div>

      {status === "error" && (
        <p className="notice notice-error" role="alert">
          {error}
        </p>
      )}

      {result && (
        <div className="result" aria-live="polite">
          <div className="result-header">
            <h2>Result</h2>
            <button type="button" className="button button-secondary" onClick={handleDownload}>
              <Download size={18} aria-hidden="true" /> Download PNG
            </button>
          </div>
          <CompareSlider
            before={result.before}
            after={result.url}
            beforeLabel="Original"
            afterLabel="Result"
            checkered={result.transparent}
          />
        </div>
      )}
    </section>
  );
};

const Studio = ({ tool }) => {
  return (
    <div className="studio">
      <nav className="tool-rail" aria-label="Tools">
        {tools.map((item) => (
          <NavLink key={item.id} to={item.path} className="tool-link">
            <item.icon size={18} aria-hidden="true" />
            {item.name}
          </NavLink>
        ))}
      </nav>
      {/* The key resets uploads and results when switching tools. */}
      <Workspace key={tool.id} tool={tool} />
    </div>
  );
};

export default Studio;
