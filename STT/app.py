import os
from flask import Flask, render_template, request, jsonify
import whisper
import tempfile
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)

# Load the Whisper model
# Using "base" model for a balance of speed and accuracy. 
# You can change this to "small", "medium", or "large" depending on your hardware.
print("Loading Whisper model...")
model = whisper.load_model("base")
print("Whisper model loaded.")
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
    with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as temp_audio:
        audio_file.save(temp_audio.name)
        temp_path = temp_audio.name

    try:
        # Transcribe the audio
        # The model automatically detects the language (Urdu or English)
        result = model.transcribe(temp_path)
        text = result['text']
        language = result['language']
        
        return jsonify({'text': text, 'language': language})
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        # Clean up the temporary file
        if os.path.exists(temp_path):
            os.remove(temp_path)



if __name__ == '__main__':
    # Run on port 5001 to avoid conflict with Express backend (port 5000)
    app.run(debug=True, port=5001)

