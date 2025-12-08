import os
import sys
import json
from dotenv import load_dotenv

from utilities.pdf_loader import load_pdfs_from_folder
from utilities.text_cleaner import clean_contract_text
from utilities.contract_parser import parse_contract
from utilities.chunker import create_hierarchical_chunks
from utilities.classifier import classify_contract_type
from utilities.embedder import generate_embeddings
from utilities.weaviate_manager import batch_insert_chunks, initialize_schema

def main():
    load_dotenv(dotenv_path="backend/.env")
    
    script_dir = os.path.dirname(os.path.abspath(__file__))
    rag_data_path = os.path.join(script_dir, "RAG_DATA")
    output_dir = os.path.join(script_dir, "output")
    jsonl_path = os.path.join(output_dir, "chunks.jsonl")

    if not os.path.exists(output_dir):
        os.makedirs(output_dir)

    # 1. Initialize Weaviate Schema
    # Note: We assume reset_weaviate was run, but initialize checks for existence anyway.
    print("\n--- Initializing Weaviate Schema ---")
    initialize_schema()

    # 2. Load PDFs
    print(f"\n--- Loading PDFs from {rag_data_path} ---")
    raw_docs = load_pdfs_from_folder(rag_data_path)
    print(f"Loaded {len(raw_docs)} PDFs.")

    if not raw_docs:
        print("No documents to process. Exiting.")
        return

    # Process documents
    chunk_buffer = []
    
    # We will write to JSONL stream and also accumulate for Weaviate
    # If dataset is huge, we shouldn't hold all in memory, but here we buffer for batching.
    
    BATCH_SIZE_THRESHOLD = 512 # Match embedder batch size for efficiency
    
    # Clear JSONL file first
    with open(jsonl_path, 'w', encoding='utf-8') as f:
        pass
        
    total_processed_chunks = 0
    failed_docs = 0

    print(f"Processing and writing to {jsonl_path}...")

    for i, doc in enumerate(raw_docs):
        try:
            file_path = doc["path"]
            raw_text = doc["text"]
            filename = os.path.basename(file_path)
            
            # 3. Clean Text
            cleaned_text = clean_contract_text(raw_text)
            
            # 4. Parse (Sections & Clauses)
            parsed_structure = parse_contract(cleaned_text)
            
            # 5. Create Hierarchical Chunks
            doc_chunks = create_hierarchical_chunks(parsed_structure, filename)
            
            # 6. Classify
            contract_type = classify_contract_type(cleaned_text[:5000])
            for chunk in doc_chunks:
                chunk["contract_type"] = contract_type
                
            # Write key metadata to JSONL
            with open(jsonl_path, 'a', encoding='utf-8') as f:
                for chunk in doc_chunks:
                    # Clean up for JSON
                    line_obj = {
                        "document_id": chunk["document_id"],
                        "section": chunk["section"],
                        "clause_number": str(chunk["clause_number"]),
                        "chunk_level": chunk["chunk_level"],
                        "text": chunk["text"]
                    }
                    f.write(json.dumps(line_obj) + "\n")

            chunk_buffer.extend(doc_chunks)

            # Flush to Weaviate if buffer hits threshold
            if len(chunk_buffer) >= BATCH_SIZE_THRESHOLD:
                print(f"  >>> Flushing {len(chunk_buffer)} chunks to Weaviate...")
                chunks_with_vectors = generate_embeddings(chunk_buffer)
                batch_insert_chunks(chunks_with_vectors)
                total_processed_chunks += len(chunks_with_vectors)
                chunk_buffer = [] 

            if (i+1) % 50 == 0:
                print(f"  Processed {i+1} documents...")

        except Exception as e:
            print(f"Error processing {filename}: {e}")
            failed_docs += 1

    # Flush final buffer
    if chunk_buffer:
        print(f"  >>> Flushing final {len(chunk_buffer)} chunks to Weaviate...")
        chunks_with_vectors = generate_embeddings(chunk_buffer)
        batch_insert_chunks(chunks_with_vectors)
        total_processed_chunks += len(chunks_with_vectors)

    print(f"\n\n--- Processing Complete ---")
    print(f"Total documents: {len(raw_docs)}")
    print(f"Failed docs: {failed_docs}")
    print(f"Total chunks in Weaviate: {total_processed_chunks}")
    print(f"JSONL exported to: {jsonl_path}")

if __name__ == "__main__":
    main()
