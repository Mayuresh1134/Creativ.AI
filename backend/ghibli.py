import tensorflow_hub as hub
import tensorflow as tf
import numpy as np
from PIL import Image
import cv2

# Load TensorFlow Hub model
model = hub.load("https://tfhub.dev/google/magenta/arbitrary-image-stylization-v1-256/2")

def load_image(image_path, size=(512, 512)):
    img = tf.io.read_file(image_path)
    img = tf.image.decode_image(img, channels=3, dtype=tf.float32)[tf.newaxis, ...]
    img = tf.image.resize(img, size)
    return img

def stylize_image(content_path, style_path):
    content_image = load_image(content_path)
    style_image = load_image(style_path, size=(256, 256))
    stylized_image = model(tf.constant(content_image), tf.constant(style_image))[0]
    
    # Convert TensorFlow tensor to numpy image
    stylized_image = np.array(stylized_image[0] * 255, dtype=np.uint8)
    result_path = "stylized_output.png"
    Image.fromarray(stylized_image).save(result_path)
    return result_path
