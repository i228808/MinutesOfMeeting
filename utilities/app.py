import os
import sys

# Ensure parent directory (Project root) is in sys.path so we can import from utilities package
current_dir = os.path.dirname(os.path.abspath(__file__))
parent_dir = os.path.dirname(current_dir)
if parent_dir not in sys.path:
    sys.path.append(parent_dir)

from flask import Flask, render_template, request, jsonify
import requests
import numpy as np
import tempfile
from dotenv import load_dotenv
import subprocess

load_dotenv()

app = Flask(__name__)

# Groq API configuration
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
GROQ_API_URL = "https://api.groq.com/openai/v1/audio/transcriptions"

if not GROQ_API_KEY:
    print("WARNING: GROQ_API_KEY not found in environment variables!")
else:
    print("Groq API key loaded successfully.")


def transcribe_with_groq(audio_path):
    """
    Transcribe audio using Groq's Whisper Large V3 API.
    Returns dict with 'text' and 'language' keys.
    """
    headers = {
        "Authorization": f"Bearer {GROQ_API_KEY}"
    }
    
    with open(audio_path, "rb") as audio_file:
        files = {
            "file": (os.path.basename(audio_path), audio_file, "audio/webm")
        }
        data = {
            "model": "whisper-large-v3",
            "response_format": "verbose_json"
        }
        
        response = requests.post(GROQ_API_URL, headers=headers, files=files, data=data)
        
        if response.status_code != 200:
            raise Exception(f"Groq API error: {response.status_code} - {response.text}")
        
        result = response.json()
        return {
            "text": result.get("text", ""),
            "language": result.get("language", "unknown")
        }


def load_audio_for_rms(audio_path):
    """
    Load audio file and return numpy array for RMS calculation.
    Uses ffmpeg to decode audio to raw PCM.
    """
    try:
        cmd = [
            "ffmpeg", "-i", audio_path,
            "-f", "f32le", "-acodec", "pcm_f32le",
            "-ac", "1", "-ar", "16000", "-"
        ]
        result = subprocess.run(cmd, capture_output=True, check=True)
        audio = np.frombuffer(result.stdout, dtype=np.float32)
        return audio
    except Exception as e:
        print(f"Error loading audio for RMS: {e}")
        return np.array([], dtype=np.float32)
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
        
        # Load audio using ffmpeg for RMS calculation
        audio = load_audio_for_rms(temp_path)
        
        # Calculate RMS (Root Mean Square) amplitude
        if len(audio) > 0:
            rms = np.sqrt(np.mean(audio**2))
            print(f"DEBUG: Audio RMS: {rms:.6f}")
        else:
            rms = 0.0
            print("DEBUG: Could not load audio for RMS, proceeding with transcription")

        # Silence threshold (adjustable)
        # 0.005 is a common threshold for "near silence" in normalized audio
        SILENCE_THRESHOLD = 0.004

        if rms < SILENCE_THRESHOLD and len(audio) > 0:
            print("DEBUG: Silence detected (RMS below threshold). Skipping transcription.")
            return jsonify({'text': '', 'language': 'unknown', 'status': 'silence'}), 200

        # Transcribe using Groq API
        result = transcribe_with_groq(temp_path)
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



# --- RAG / Weaviate Integration ---
import weaviate
from sentence_transformers import SentenceTransformer

print("Loading Embedding Model (all-MiniLM-L6-v2)...")
# Initialize embedding model (auto-detects CUDA if available)
embedding_model = SentenceTransformer('all-MiniLM-L6-v2')
print("Embedding Model Loaded.")

def search_weaviate(query_text, limit=5):
    """
    Search Weaviate for similar chunks
    """
    try:
        # Generate vector
        vector = embedding_model.encode(query_text, convert_to_numpy=True).tolist()
        
        # Connect to Weaviate (Local 8081)
        client = weaviate.connect_to_local(
            port=8081,
            grpc_port=50052
        )
        
        collection = client.collections.get("ContractChunk")
        
        results = collection.query.near_vector(
            near_vector=vector,
            limit=limit,
            return_properties=["text", "section", "clause_number", "document_id", "contract_type"]
        )
        
        client.close()
        
        # Format results
        hits = []
        for obj in results.objects:
            hits.append({
                "text": obj.properties.get("text"),
                "section": obj.properties.get("section"),
                "clause_number": obj.properties.get("clause_number"),
                "document_id": obj.properties.get("document_id"),
                "contract_type": obj.properties.get("contract_type")
            })
            
        return hits
    except Exception as e:
        print(f"Weaviate Query Error: {e}")
        return []

@app.route('/query', methods=['POST'])
def query_rag():
    data = request.json
    if not data or 'query' not in data:
        return jsonify({'error': 'No query provided'}), 400
        
    query_text = data['query']
    limit = data.get('limit', 5)
    
    print(f"Received RAG Query: {query_text}")
    results = search_weaviate(query_text, limit)
    
    return jsonify({'results': results})

# --- New Endpoint for Continuous Learning ---
from utilities.text_cleaner import clean_contract_text
from utilities.contract_parser import parse_contract
from utilities.chunker import create_hierarchical_chunks
from utilities.weaviate_manager import batch_insert_chunks

@app.route('/process_contracts', methods=['POST'])
def process_contracts():
    """
    Endpoint to process a batch of contracts from the backend.
    Payload: { "contracts": [ { "text": "...", "document_id": "...", "contract_type": "..." } ] }
    """
    data = request.json
    contracts = data.get('contracts', [])
    
    if not contracts:
        return jsonify({'message': 'No contracts provided.', 'processed': 0}), 200

    print(f"Received batch of {len(contracts)} contracts for RAG processing...")
    
    processed_count = 0
    chunk_buffer = []
    
    try:
        for doc in contracts:
            raw_text = doc.get("text", "")
            doc_id = doc.get("document_id", "unknown")
            c_type = doc.get("contract_type", "General")
            
            if not raw_text:
                continue
                
            # 1. Pipeline Steps
            cleaned_text = clean_contract_text(raw_text)
            parsed_structure = parse_contract(cleaned_text)
            doc_chunks = create_hierarchical_chunks(parsed_structure, doc_id)
            
            # 2. Add metadata
            for chunk in doc_chunks:
                chunk["contract_type"] = c_type
            
            chunk_buffer.extend(doc_chunks)
            processed_count += 1
        
        if chunk_buffer:
            print(f"Generating embeddings for {len(chunk_buffer)} new chunks...")
            # Use the global embedding_model initialized above
            embeddings = embedding_model.encode(
                [c["text"] for c in chunk_buffer], 
                batch_size=256, 
                convert_to_numpy=True
            ).tolist()
            
            for i, chunk in enumerate(chunk_buffer):
                chunk["vector"] = embeddings[i]
            
            print(f"Inserting {len(chunk_buffer)} chunks to Weaviate...")
            batch_insert_chunks(chunk_buffer)
            
        return jsonify({'success': True, 'processed_contracts': processed_count, 'chunks_inserted': len(chunk_buffer)})
        
    except Exception as e:
        print(f"Error in /process_contracts: {e}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    # Run on port 5001 to avoid conflict with Express backend (port 5000)
    app.run(debug=True, use_reloader=False, port=5001)

