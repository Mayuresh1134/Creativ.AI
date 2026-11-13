import os
import time
import uuid

from flask import Flask, jsonify, request
from flask_cors import CORS
from PIL import UnidentifiedImageError
from werkzeug.exceptions import RequestEntityTooLarge

import effects
from models import ModelUnavailable

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
UPLOAD_FOLDER = os.path.join(BASE_DIR, "static", "uploads")
RESULT_FOLDER = os.path.join(BASE_DIR, "static", "results")

ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".bmp"}
MAX_UPLOAD_MB = 16
RESULT_MAX_AGE_SECONDS = 60 * 60  # results are deleted after an hour

app = Flask(__name__, static_folder=os.path.join(BASE_DIR, "static"))
app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER
app.config["RESULT_FOLDER"] = RESULT_FOLDER
app.config["MAX_CONTENT_LENGTH"] = MAX_UPLOAD_MB * 1024 * 1024
CORS(app)

os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(RESULT_FOLDER, exist_ok=True)


class UploadError(ValueError):
    """The request is missing a file or the file is not a usable image."""


def save_upload(field):
    """Save an uploaded file under a random name and return its path."""
    file = request.files.get(field)
    if file is None or not file.filename:
        raise UploadError(f"Missing file: {field}")

    extension = os.path.splitext(file.filename)[1].lower()
    if extension not in ALLOWED_EXTENSIONS:
        allowed = ", ".join(sorted(e.lstrip(".") for e in ALLOWED_EXTENSIONS))
        raise UploadError(f"Unsupported file type. Use one of: {allowed}.")

    path = os.path.join(UPLOAD_FOLDER, f"{uuid.uuid4().hex}{extension}")
    file.save(path)
    return path


def remove_old_results():
    cutoff = time.time() - RESULT_MAX_AGE_SECONDS
    for name in os.listdir(RESULT_FOLDER):
        path = os.path.join(RESULT_FOLDER, name)
        try:
            if os.path.isfile(path) and os.path.getmtime(path) < cutoff:
                os.remove(path)
        except OSError:
            pass


def run_tool(fn, prefix, fields=("content",), **options):
    """Save the uploads, run an effect on them and return the result as JSON.

    Every result gets its own random filename, so simultaneous users never
    overwrite each other and browsers never show a stale cached image.
    Uploads are deleted as soon as the effect has run.
    """
    paths = []
    try:
        for field in fields:
            paths.append(save_upload(field))
        image = fn(*paths, **options)

        remove_old_results()
        result_name = f"{prefix}_{uuid.uuid4().hex}.png"
        image.save(os.path.join(RESULT_FOLDER, result_name))
        return jsonify(
            {
                "result_img": result_name,
                "result_url": f"/static/results/{result_name}",
                "width": image.width,
                "height": image.height,
            }
        )
    except UploadError as exc:
        return jsonify({"error": str(exc)}), 400
    except (UnidentifiedImageError, OSError):
        return jsonify({"error": "That file could not be read as an image."}), 400
    except ModelUnavailable as exc:
        return jsonify({"error": str(exc)}), 503
    except Exception:
        app.logger.exception("Tool %s failed", prefix)
        return jsonify({"error": "Something went wrong while processing the image."}), 500
    finally:
        for path in paths:
            try:
                os.remove(path)
            except OSError:
                pass


def choice(name, allowed, default):
    value = request.form.get(name, default)
    return value if value in allowed else default


@app.errorhandler(RequestEntityTooLarge)
def too_large(_error):
    return jsonify({"error": f"Images must be {MAX_UPLOAD_MB} MB or smaller."}), 413


@app.route("/health")
def health():
    return jsonify({"status": "ok"})


@app.route("/stylize", methods=["POST"])
def process_style_transfer():
    return run_tool(effects.stylize, "stylized", fields=("content", "style"))


@app.route("/cartoonize", methods=["POST"])
def process_cartoonization():
    style = choice("style", {"classic", "anime"}, "classic")
    return run_tool(effects.cartoonize, "cartoon", style=style)


@app.route("/remove-background", methods=["POST"])
def process_background_removal():
    background = choice("background", {"transparent", "white", "black", "blur"}, "transparent")
    return run_tool(effects.remove_background, "cutout", background=background)


@app.route("/upscale", methods=["POST"])
def process_upscale():
    scale = int(choice("scale", {"2", "4"}, "2"))
    quality = choice("quality", {"fast", "sharp"}, "fast")
    return run_tool(effects.upscale, "upscaled", scale=scale, quality=quality)


@app.route("/sketch", methods=["POST"])
def process_sketch():
    effect = choice("effect", {"pencil", "color-pencil", "watercolor"}, "pencil")
    return run_tool(effects.artistic, "sketch", effect=effect)


@app.route("/colorize", methods=["POST"])
def process_colorize():
    return run_tool(effects.colorize, "colorized")


if __name__ == "__main__":
    app.run(debug=True)
