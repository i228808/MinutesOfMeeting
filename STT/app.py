import os
from flask import Flask, render_template, request, jsonify
import whisper
import numpy as np
import tempfile
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)

# Load the Whisper model
# Using "base" model for a balance of speed and accuracy. 
# You can change this to "small", "medium", or "large" depending on your hardware.
import torch

print("Checking for CUDA...")
DEVICE = "cuda" if torch.cuda.is_available() else "cpu"
# Use 'base' for faster real-time performance (even on GPU)
MODEL_SIZE = "base"

print(f"Device: {DEVICE} | Model Size: {MODEL_SIZE}")
if DEVICE == "cuda":
    print(f"GPU: {torch.cuda.get_device_name(0)}")
else:
    print("WARNING: CUDA not found. Running on CPU (slower).")

print(f"Loading Whisper model ({MODEL_SIZE})...")
model = whisper.load_model(MODEL_SIZE, device=DEVICE)
print("Whisper model loaded.")
print("Whisper model loaded.")

# Lock for thread safety
import threading
model_lock = threading.Lock()
@app.route('/')
def index():
    return render_template('index.html')

@app.route('/transcribe', methods=['POST'])
def transcribe():
    if 'audio' not in request.files:
        return jsonify({'error': 'No audio file provided'}), 400
    
    audio_file = request.files['audio']
    if audio_file.filename == '':
        return jsonify({'error': 'No selected file'}), 400

    # Save the file temporarily
    # Fix for Windows: Close the temp file handle before Flask tries to write to it
    temp_path = None
    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=".webm") as temp_audio:
            temp_path = temp_audio.name
        
        # Now save to the path (file is closed)
        audio_file.save(temp_path)
        
        # Check size
        file_size = os.path.getsize(temp_path)
        print(f"DEBUG: Saved file {temp_path} | Size: {file_size} bytes")

        # RMS Silence Detection
        
        # Load audio using Whisper's internal utility (supports WebM, etc.)
        # This returns a float32 numpy array between -1 and 1
        audio = whisper.load_audio(temp_path)
        
        # Calculate RMS (Root Mean Square) amplitude
        rms = np.sqrt(np.mean(audio**2))
        print(f"DEBUG: Audio RMS: {rms:.6f}")

        # Silence threshold (adjustable)
        # 0.005 is a common threshold for "near silence" in normalized audio
        SILENCE_THRESHOLD = 0.004

        if rms < SILENCE_THRESHOLD:
            print("DEBUG: Silence detected (RMS below threshold). Skipping transcription.")
            return jsonify({'text': '', 'language': 'unknown', 'status': 'silence'}), 200

        # Transcribe the audio
        # beam_size=5 improves accuracy and language detection stability at the cost of speed
        # fp16=False is safer for CPU usage to avoid warnings
        # LOCKING: Whisper is not thread-safe. We must ensure only one request uses the model at a time.
        with model_lock:
            # fp16=True is safe and faster on CUDA, but not CPU
            use_fp16 = (DEVICE == "cuda")
            # beam_size=1 (greedy) is much faster and prevents queue buildup during real-time streaming
            result = model.transcribe(audio, beam_size=1, fp16=use_fp16) 
        text = result['text']
        language = result['language']
        
        return jsonify({'text': text, 'language': language})
    except RuntimeError as e:
        if "cannot reshape tensor of 0 elements" in str(e):
            print(f"DEBUG: Empty/Invalid audio segment detected (Whisper Error). Returning empty.")
            return jsonify({'text': '', 'language': 'unknown', 'status': 'empty_audio'}), 200
        else:
            import traceback
            traceback.print_exc()
            return jsonify({'text': '[Error]', 'language': 'unknown', 'error': str(e)}), 200
    except Exception as e:
        import traceback
        traceback.print_exc() # Print to console
        # Return 200 with error text to prevent backend crash
        return jsonify({'text': '[Unintelligible/Error]', 'language': 'unknown', 'error': str(e)}), 200
    finally:
        # Clean up the temporary file
        if temp_path and os.path.exists(temp_path):
            try:
                os.remove(temp_path)
            except:
                pass



if __name__ == '__main__':
    # Run on port 5001 to avoid conflict with Express backend (port 5000)
    app.run(debug=True, use_reloader=False, port=5001)

