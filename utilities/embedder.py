from typing import List, Dict, Any
from sentence_transformers import SentenceTransformer

# Initialize the model once (global cache)
# 'all-MiniLM-L6-v2' is a good balance of speed and quality for local use
_model = None

def get_model():
    global _model
    if _model is None:
        print("Loading local embedding model (all-MiniLM-L6-v2) on CUDA...")
        _model = SentenceTransformer('all-MiniLM-L6-v2', device='cuda')
    return _model

def generate_embeddings(chunks: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """
    Generates embeddings for a list of chunk objects using local SentenceTransformers.
    Attaches them to the 'vector' key.
    """
    if not chunks:
        return []

    model = get_model()
    
    texts = [chunk["text"] for chunk in chunks]
    
    try:
        # Encode all texts at once (the library handles batching efficiently)
        embeddings = model.encode(texts, batch_size=512, convert_to_numpy=True)
        
        for i, chunk in enumerate(chunks):
            # Convert numpy array to list for JSON serialization/Weaviate
            chunk["vector"] = embeddings[i].tolist()
                
    except Exception as e:
        print(f"Error generating embeddings: {e}")
        
    return chunks
