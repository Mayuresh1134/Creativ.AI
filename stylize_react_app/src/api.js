// Where the Flask backend lives. Override with REACT_APP_API_URL in a .env file.
export const API_URL = (process.env.REACT_APP_API_URL || "http://127.0.0.1:5000").replace(/\/$/, "");

// Send images and options to a tool endpoint. Returns the URL of the result.
export async function runTool(endpoint, files, options) {
  const formData = new FormData();
  Object.entries(files).forEach(([name, file]) => formData.append(name, file));
  Object.entries(options).forEach(([name, value]) => formData.append(name, value));

  let response;
  try {
    response = await fetch(`${API_URL}${endpoint}`, { method: "POST", body: formData });
  } catch (error) {
    throw new Error(
      `Can't reach the backend at ${API_URL}. Start it with "python app.py" in the backend folder, then try again.`
    );
  }

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || "The image could not be processed. Try a different image.");
  }
  return `${API_URL}/static/results/${data.result_img}`;
}
