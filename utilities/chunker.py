import tiktoken
from typing import List, Dict, Any, Optional

# Constants
ENC = tiktoken.get_encoding("cl100k_base")

def get_token_count(text: str) -> int:
    return len(ENC.encode(text))

def chunk_text_semantically(text: str, max_tokens: int = 512, overlap: int = 128) -> List[str]:
    """
    Fallback semantic chunking by token count.
    """
    tokens = ENC.encode(text)
    total_tokens = len(tokens)
    
    chunks = []
    start = 0
    while start < total_tokens:
        end = min(start + max_tokens, total_tokens)
        chunk_tokens = tokens[start:end]
        chunk_text = ENC.decode(chunk_tokens)
        chunks.append(chunk_text)
        
        if end == total_tokens:
            break
        start += (max_tokens - overlap)
        
    return chunks

def create_hierarchical_chunks(parsed_structure: List[Dict[str, Any]], filename: str) -> List[Dict[str, Any]]:
    final_chunks = []
    
    # Check if structure is empty/poor (Level 3 trigger)
    # If only one section (Preamble) and no clauses detected?
    total_sections = len(parsed_structure)
    total_clauses = sum(len(s.get("clauses", [])) for s in parsed_structure)
    
    use_fallback = False
    if total_sections <= 1 and total_clauses <= 1:
        use_fallback = True
        
    # --- Level 1: Clause-level Chunks ---
    # Target: 150-350 tokens, Overlap 60-100
    # Strategy: Iterate clauses. If clause < 150, look ahead and merge? 
    # User says "Clause = smallest chunk unit". But also "Target 150-350".
    # I will merge small adjacent clauses to meet the target.
    
    if not use_fallback:
        for sec in parsed_structure:
            section_title = sec["section_title"]
            clauses = sec["clauses"]
            
            # Buffer for merging
            current_buffer_text = ""
            current_buffer_ids = []
            
            for clause in clauses:
                c_text = clause["text"]
                c_num = clause["number"]
                
                # If adding this clause exceeds max(350), flush current buffer first
                # (Unless buffer is empty, then we must take it, or split it if huge)
                combined_text = (current_buffer_text + "\n" + c_text).strip()
                count = get_token_count(combined_text)
                
                if count > 350 and current_buffer_text:
                    # Flush existing buffer
                    final_chunks.append({
                        "document_id": filename,
                        "section": section_title,
                        "clause_number": ", ".join([str(x) for x in current_buffer_ids if x]),
                        "chunk_level": 1,
                        "text": current_buffer_text,
                        "token_count": get_token_count(current_buffer_text)
                    })
                    # Start new buffer with current clause
                    current_buffer_text = c_text
                    current_buffer_ids = [c_num]
                else:
                    # Add to buffer
                    current_buffer_text = combined_text
                    current_buffer_ids.append(c_num)
                    
            # Flush final buffer for this section
            if current_buffer_text:
                final_chunks.append({
                    "document_id": filename,
                    "section": section_title,
                    "clause_number": ", ".join([str(x) for x in current_buffer_ids if x]),
                    "chunk_level": 1,
                    "text": current_buffer_text,
                    "token_count": get_token_count(current_buffer_text)
                })

    # --- Level 2: Section-level Chunks ---
    # Target: 500-1200 tokens. Overlap 150.
    # We chunk the 'section_text'.
    
    if not use_fallback:
        for sec in parsed_structure:
            sec_text = sec["section_text"]
            sec_title = sec["section_title"]
            
            # If section itself is small, take it all
            if get_token_count(sec_text) <= 1200:
                final_chunks.append({
                    "document_id": filename,
                    "section": sec_title,
                    "clause_number": "SECTION_SUMMARY",
                    "chunk_level": 2,
                    "text": sec_text,
                    "token_count": get_token_count(sec_text)
                })
            else:
                # Split section text mostly by token window
                # We can reuse semantic splitter or sliding window
                sub_chunks = chunk_text_semantically(sec_text, max_tokens=1000, overlap=150)
                for sc in sub_chunks:
                    final_chunks.append({
                        "document_id": filename,
                        "section": sec_title,
                        "clause_number": "SECTION_PART",
                        "chunk_level": 2,
                        "text": sc,
                        "token_count": get_token_count(sc)
                    })

    # --- Level 3: Semantic Fallback ---
    # Trigger if structure broken.
    if use_fallback:
        # Reconstruct full text? Or just iterate sections (which is just preamble)
        full_text = "\n".join([s["section_text"] for s in parsed_structure])
        semantic_chunks = chunk_text_semantically(full_text, max_tokens=512, overlap=128)
        
        for ch in semantic_chunks:
             final_chunks.append({
                "document_id": filename,
                "section": "Fallback",
                "clause_number": None,
                "chunk_level": 3,
                "text": ch,
                "token_count": get_token_count(ch)
            })
            
    return final_chunks
