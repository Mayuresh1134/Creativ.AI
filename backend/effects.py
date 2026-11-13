"""Image effects. Every public function takes file paths and returns a PIL image."""

import cv2
import numpy as np
from PIL import Image, ImageOps

import models

# Longest side, in pixels, that each tool will work on. Larger inputs are
# scaled down first so a phone photo doesn't take minutes on a CPU.
MAX_SIDE = 2048
MAX_SIDE_ANIME = 1024
MAX_SIDE_UPSCALE = {"FSRCNN": 1024, "EDSR": 384}  # EDSR is slow on a CPU
STYLE_CONTENT_SIDE = 512
STYLE_IMAGE_SIZE = (256, 256)

EDSR_MEAN = (103.1545782, 111.561547, 114.35629928)  # BGR, from the EDSR weights


def load_rgb(path, max_side=MAX_SIDE):
    """Read an image as an RGB uint8 array, upright, at most max_side wide/tall."""
    image = ImageOps.exif_transpose(Image.open(path))
    if image.mode in ("RGBA", "LA", "P"):
        image = image.convert("RGBA")
        background = Image.new("RGBA", image.size, (255, 255, 255, 255))
        image = Image.alpha_composite(background, image)
    image = image.convert("RGB")
    if max_side and max(image.size) > max_side:
        image.thumbnail((max_side, max_side), Image.LANCZOS)
    return np.asarray(image)


# --------------------------------------------------------------------------
# Style transfer
# --------------------------------------------------------------------------

def stylize(content_path, style_path):
    import tensorflow as tf

    model = models.style_model()

    # The content image keeps its aspect ratio; only the style image is
    # squashed to the 256x256 the model was trained on.
    content = load_rgb(content_path, max_side=STYLE_CONTENT_SIDE)
    style = cv2.resize(load_rgb(style_path), STYLE_IMAGE_SIZE, interpolation=cv2.INTER_AREA)

    content_t = tf.constant(content[np.newaxis].astype(np.float32) / 255.0)
    style_t = tf.constant(style[np.newaxis].astype(np.float32) / 255.0)

    stylized = model(content_t, style_t)[0]
    stylized = np.clip(np.asarray(stylized[0]) * 255.0, 0, 255).astype(np.uint8)
    return Image.fromarray(stylized)


# --------------------------------------------------------------------------
# Cartoon
# --------------------------------------------------------------------------

def cartoonize_classic(image_path):
    img = load_rgb(image_path)

    gray = cv2.cvtColor(img, cv2.COLOR_RGB2GRAY)
    blurred = cv2.medianBlur(gray, 7)
    edges = cv2.adaptiveThreshold(
        blurred, 255, cv2.ADAPTIVE_THRESH_MEAN_C, cv2.THRESH_BINARY, 9, 9
    )

    color = cv2.bilateralFilter(img, d=9, sigmaColor=200, sigmaSpace=200)
    cartoon = cv2.bitwise_and(color, color, mask=edges)
    return Image.fromarray(cartoon)


def cartoonize_anime(image_path):
    session = models.anime_session()
    img = load_rgb(image_path, max_side=MAX_SIDE_ANIME)
    height, width = img.shape[:2]

    # The network needs sides that are multiples of 32.
    def to_32s(x):
        return 256 if x < 256 else x - x % 32

    resized = cv2.resize(img, (to_32s(width), to_32s(height)), interpolation=cv2.INTER_AREA)
    batch = (resized.astype(np.float32) / 127.5 - 1.0)[np.newaxis]

    input_name = session.get_inputs()[0].name
    output = session.run(None, {input_name: batch})[0]

    result = np.clip((np.squeeze(output) + 1.0) * 127.5, 0, 255).astype(np.uint8)
    result = cv2.resize(result, (width, height), interpolation=cv2.INTER_CUBIC)
    return Image.fromarray(result)


def cartoonize(image_path, style="classic"):
    if style == "anime":
        return cartoonize_anime(image_path)
    return cartoonize_classic(image_path)


# --------------------------------------------------------------------------
# Background removal
# --------------------------------------------------------------------------

def remove_background(image_path, background="transparent"):
    from rembg import remove

    img = load_rgb(image_path)
    cutout = remove(Image.fromarray(img), session=models.background_session())
    cutout = cutout.convert("RGBA")

    if background == "transparent":
        return cutout
    if background == "blur":
        # Keep the subject sharp and blur what was behind it.
        sigma = max(img.shape[:2]) / 60.0
        backdrop = Image.fromarray(cv2.GaussianBlur(img, (0, 0), sigma)).convert("RGBA")
    else:
        fill = (0, 0, 0, 255) if background == "black" else (255, 255, 255, 255)
        backdrop = Image.new("RGBA", cutout.size, fill)
    return Image.alpha_composite(backdrop, cutout).convert("RGB")


# --------------------------------------------------------------------------
# Upscaling
# --------------------------------------------------------------------------

def _upscale_fsrcnn(model, bgr):
    # FSRCNN sharpens the brightness channel only; colour is resized normally.
    ycrcb = cv2.cvtColor(bgr, cv2.COLOR_BGR2YCrCb)
    y_in = ycrcb[np.newaxis, :, :, :1].astype(np.float32) / 255.0
    y = np.clip(np.asarray(model(y_in))[0, 0] * 255.0, 0, 255).astype(np.uint8)

    size = (y.shape[1], y.shape[0])
    chroma = cv2.resize(ycrcb[:, :, 1:], size, interpolation=cv2.INTER_CUBIC)
    return cv2.cvtColor(np.dstack([y, chroma]), cv2.COLOR_YCrCb2BGR)


def _upscale_edsr(model, bgr):
    mean = np.array(EDSR_MEAN, dtype=np.float32)
    out = np.asarray(model((bgr.astype(np.float32) - mean)[np.newaxis]))[0]
    return np.clip(out.transpose(1, 2, 0) + mean, 0, 255).astype(np.uint8)


def upscale(image_path, scale=2, quality="fast"):
    scale = 4 if int(scale) == 4 else 2
    kind = "EDSR" if quality == "sharp" else "FSRCNN"

    img = load_rgb(image_path, max_side=MAX_SIDE_UPSCALE[kind])
    bgr = cv2.cvtColor(img, cv2.COLOR_RGB2BGR)

    model = models.superres_model(kind, scale)
    run = _upscale_edsr if kind == "EDSR" else _upscale_fsrcnn
    return Image.fromarray(cv2.cvtColor(run(model, bgr), cv2.COLOR_BGR2RGB))


# --------------------------------------------------------------------------
# Sketch and watercolour
# --------------------------------------------------------------------------

def _pencil_lines(gray):
    """Classic dodge-blend sketch: dark lines on white paper."""
    sigma = max(gray.shape[:2]) / 120.0
    blurred = cv2.GaussianBlur(255 - gray, (0, 0), sigma)
    return cv2.divide(gray, 255 - blurred, scale=256)


def artistic(image_path, effect="pencil"):
    img = load_rgb(image_path)

    if effect == "watercolor":
        return Image.fromarray(cv2.stylization(img, sigma_s=60, sigma_r=0.45))

    lines = _pencil_lines(cv2.cvtColor(img, cv2.COLOR_RGB2GRAY))
    if effect == "color-pencil":
        # Soft colour wash underneath, pencil lines multiplied on top.
        wash = cv2.edgePreservingFilter(img, flags=cv2.RECURS_FILTER, sigma_s=60, sigma_r=0.4)
        wash = cv2.addWeighted(wash, 0.75, np.full_like(wash, 255), 0.25, 0)
        strength = (lines[:, :, np.newaxis].astype(np.float32) / 255.0) ** 2
        colored = wash.astype(np.float32) * strength
        return Image.fromarray(np.clip(colored, 0, 255).astype(np.uint8))
    return Image.fromarray(lines)


# --------------------------------------------------------------------------
# Colorization
# --------------------------------------------------------------------------

def colorize(image_path):
    session = models.colorizer_session()
    img = load_rgb(image_path)
    height, width = img.shape[:2]

    # Work in Lab: the model sees lightness (L, 0-100) and predicts colour (ab).
    gray = cv2.cvtColor(img, cv2.COLOR_RGB2GRAY)
    lightness = gray.astype(np.float32) * (100.0 / 255.0)
    small = cv2.resize(lightness, (256, 256), interpolation=cv2.INTER_CUBIC)

    input_name = session.get_inputs()[0].name
    ab = np.squeeze(session.run(None, {input_name: small[np.newaxis, np.newaxis]})[0])
    if ab.shape[0] == 2:  # (2, H, W) -> (H, W, 2)
        ab = ab.transpose(1, 2, 0)
    ab = cv2.resize(ab.astype(np.float32), (width, height), interpolation=cv2.INTER_LINEAR)

    lab = np.dstack([lightness, ab]).astype(np.float32)
    rgb = cv2.cvtColor(lab, cv2.COLOR_Lab2RGB)
    return Image.fromarray(np.clip(rgb * 255.0, 0, 255).astype(np.uint8))
