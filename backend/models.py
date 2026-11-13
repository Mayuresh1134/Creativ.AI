"""Lazy model loading.

Nothing heavy is imported or downloaded when the server starts. Each model is
fetched into backend/models/ the first time its tool is used, then kept in
memory for later requests.
"""

import os
import shutil
import threading
import urllib.request

MODEL_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "models")

STYLE_HUB_HANDLE = "https://tfhub.dev/google/magenta/arbitrary-image-stylization-v1-256/1"

MODEL_URLS = {
    # AnimeGANv2 (Shinkai style). Non-commercial licence, see README.
    "animegan_shinkai.onnx": "https://raw.githubusercontent.com/TachibanaYoshino/AnimeGANv2/master/pb_and_onnx_model/Shinkai_53.onnx",
    # Super-resolution: FSRCNN is tiny and fast, EDSR is slower and sharper.
    "FSRCNN_x2.pb": "https://raw.githubusercontent.com/Saafke/FSRCNN_Tensorflow/master/models/FSRCNN_x2.pb",
    "FSRCNN_x4.pb": "https://raw.githubusercontent.com/Saafke/FSRCNN_Tensorflow/master/models/FSRCNN_x4.pb",
    "EDSR_x2.pb": "https://raw.githubusercontent.com/Saafke/EDSR_Tensorflow/master/models/EDSR_x2.pb",
    "EDSR_x4.pb": "https://raw.githubusercontent.com/Saafke/EDSR_Tensorflow/master/models/EDSR_x4.pb",
    # Zhang et al. "Colorful Image Colorization", the ONNX export used by
    # OpenCV's own samples/dnn/colorization.py.
    "colorizer.onnx": "https://storage.googleapis.com/ailia-models/colorization/colorizer.onnx",
}


class ModelUnavailable(RuntimeError):
    """A model could not be downloaded or loaded."""


_lock = threading.Lock()
_cache = {}


def _once(key, factory):
    """Build a model once, even if several requests ask for it together."""
    if key not in _cache:
        with _lock:
            if key not in _cache:
                _cache[key] = factory()
    return _cache[key]


def model_path(name):
    """Return the local path of a model file, downloading it if needed."""
    path = os.path.join(MODEL_DIR, name)
    if os.path.exists(path):
        return path

    os.makedirs(MODEL_DIR, exist_ok=True)
    url = MODEL_URLS[name]
    tmp_path = path + ".part"
    try:
        request = urllib.request.Request(url, headers={"User-Agent": "Creativ.AI"})
        with urllib.request.urlopen(request, timeout=120) as response, open(tmp_path, "wb") as out:
            shutil.copyfileobj(response, out)
        os.replace(tmp_path, path)
    except Exception as exc:
        if os.path.exists(tmp_path):
            os.remove(tmp_path)
        raise ModelUnavailable(
            f"Could not download the model file {name}. Check your internet "
            f"connection, or download {url} yourself and save it as "
            f"backend/models/{name}."
        ) from exc
    return path


def _onnx_session(name):
    import onnxruntime as ort

    return ort.InferenceSession(model_path(name), providers=["CPUExecutionProvider"])


def style_model():
    def load():
        try:
            import tensorflow_hub as hub

            return hub.load(STYLE_HUB_HANDLE)
        except Exception as exc:
            raise ModelUnavailable(
                "Could not load the style transfer model from TensorFlow Hub. "
                "Check that tensorflow and tensorflow-hub are installed and "
                "that you are online the first time you use this tool."
            ) from exc

    return _once("style", load)


def anime_session():
    return _once("anime", lambda: _onnx_session("animegan_shinkai.onnx"))


def colorizer_session():
    return _once("colorizer", lambda: _onnx_session("colorizer.onnx"))


def background_session():
    def load():
        try:
            from rembg import new_session

            return new_session("u2net")
        except Exception as exc:
            raise ModelUnavailable(
                "Could not load the background removal model. Check that "
                "rembg is installed and that you are online the first time "
                "you use this tool."
            ) from exc

    return _once("background", load)


def superres_model(kind, scale):
    """Return a function that maps a float32 NHWC array to an NCHW array.

    The weights are TensorFlow frozen graphs, so they run on the TensorFlow
    that style transfer already needs.
    """
    name = f"{kind}_x{scale}.pb"

    def load():
        import tensorflow as tf

        graph_def = tf.compat.v1.GraphDef()
        with open(model_path(name), "rb") as f:
            graph_def.ParseFromString(f.read())
        channels = 3 if kind == "EDSR" else 1

        def import_graph():
            image = tf.compat.v1.placeholder(tf.float32, [None, None, None, channels], name="image")
            tf.compat.v1.import_graph_def(graph_def, input_map={"IteratorGetNext:0": image}, name="")

        wrapped = tf.compat.v1.wrap_function(import_graph, [])
        pruned = wrapped.prune("image:0", "NCHW_output:0")
        return lambda batch: pruned(tf.constant(batch)).numpy()

    return _once(name, load)
