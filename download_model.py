from huggingface_hub import hf_hub_download
import os
import logging
from tqdm.auto import tqdm

# Configure logging
logging.basicConfig(level=logging.INFO, format=\'%(asctime)s - %(levelname)s - %(message)s\')

MODEL_NAME = "alirezamsh/small100"
MODEL_FILES = {
    "model.onnx": "model.onnx",
    "sentencepiece.bpe.model": "sentencepiece.bpe.model"
}

LOCAL_DIR = "local-translation-models"

def download_models():
    os.makedirs(LOCAL_DIR, exist_ok=True)
    for hf_file, local_file in MODEL_FILES.items():
        local_path = os.path.join(LOCAL_DIR, local_file)
        if os.path.exists(local_path):
            logging.info(f"File {local_file} already exists. Skipping download.")
            continue

        logging.info(f"Attempting to download {hf_file}...")
        try:
            # Use tqdm for progress bar
            hf_hub_download(
                repo_id=MODEL_NAME,
                filename=hf_file,
                local_dir=LOCAL_DIR,
                local_dir_use_symlinks=False,
                # Pass a callback to tqdm for progress updates
                # This requires a custom callback function or using a wrapper
                # For simplicity, hf_hub_download itself can show progress if `tqdm` is installed
                # We'll rely on its built-in progress for now, or implement a custom one if needed.
            )
            logging.info(f"Successfully downloaded {hf_file} to {LOCAL_DIR}/{local_file}")
        except Exception as e:
            logging.error(f"Error downloading {hf_file}: {e}")

if __name__ == "__main__":
    download_models()


