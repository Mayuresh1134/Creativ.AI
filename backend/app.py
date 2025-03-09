from flask import Flask, request, jsonify
from werkzeug.utils import secure_filename
import os
import tensorflow as tf
import tensorflow_hub as hub
import numpy as np
import cv2
from PIL import Image
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

UPLOAD_FOLDER = "static/uploads"
RESULT_FOLDER = "static/results"
app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER
app.config["RESULT_FOLDER"] = RESULT_FOLDER

os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(RESULT_FOLDER, exist_ok=True)

hub_handle = "https://tfhub.dev/google/magenta/arbitrary-image-stylization-v1-256/2"
hub_module = hub.load(hub_handle)

def load_image(image_path, image_size=(512, 512)):
    img = tf.io.read_file(image_path)
    img = tf.image.decode_image(img, channels=3, dtype=tf.float32)[tf.newaxis, ...]
    img = tf.image.resize(img, image_size)
    return img

def stylize_image(content_path, style_path):
    content_image = load_image(content_path)
    style_image = load_image(style_path, image_size=(256, 256))
    
    outputs = hub_module(tf.constant(content_image), tf.constant(style_image))
    stylized_image = outputs[0]

    stylized_image = np.array(stylized_image[0] * 255, dtype=np.uint8)
    result_path = os.path.join(app.config["RESULT_FOLDER"], "stylized_output.png")
    Image.fromarray(stylized_image).save(result_path)

    return result_path

def cartoonize_image(image_path):
    img = cv2.imread(image_path)
    img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
    
    gray = cv2.cvtColor(img, cv2.COLOR_RGB2GRAY)
    blurred = cv2.medianBlur(gray, 7)
    edges = cv2.adaptiveThreshold(blurred, 255, cv2.ADAPTIVE_THRESH_MEAN_C, cv2.THRESH_BINARY, 9, 9)
    
    color = cv2.bilateralFilter(img, d=9, sigmaColor=200, sigmaSpace=200)
    cartoon = cv2.bitwise_and(color, color, mask=edges)
    
    result_path = os.path.join(app.config["RESULT_FOLDER"], "cartoonized_output.png")
    Image.fromarray(cartoon).save(result_path)
    
    return result_path

@app.route("/stylize", methods=["POST"])
def process_style_transfer():
    if "content" not in request.files or "style" not in request.files:
        return jsonify({"error": "Missing file(s)"}), 400
    
    content_file = request.files["content"]
    style_file = request.files["style"]

    content_filename = secure_filename(content_file.filename)
    style_filename = secure_filename(style_file.filename)
    content_path = os.path.join(app.config["UPLOAD_FOLDER"], content_filename)
    style_path = os.path.join(app.config["UPLOAD_FOLDER"], style_filename)

    content_file.save(content_path)
    style_file.save(style_path)

    result_path = stylize_image(content_path, style_path)
    return jsonify({"result_img": os.path.basename(result_path)})

@app.route("/cartoonize", methods=["POST"])
def process_cartoonization():
    if "content" not in request.files:
        return jsonify({"error": "Missing file"}), 400
    
    content_file = request.files["content"]
    content_filename = secure_filename(content_file.filename)
    content_path = os.path.join(app.config["UPLOAD_FOLDER"], content_filename)
    
    content_file.save(content_path)
    result_path = cartoonize_image(content_path)
    
    return jsonify({"result_img": os.path.basename(result_path)})

if __name__ == "__main__":
    app.run(debug=True)
