import re
from typing import List, Dict, Any

# Section Regex Patterns
SECTION_PATTERNS = [
    r"^\s*(SECTION|ARTICLE)\s+\d+[.:]?\s+[A-Z][A-Za-z].*",  # SECTION 1. Title
    r"^\s*\d+\.\s+[A-Z].*",                                   # 1. Title
    r"^\s*\d+(\.\d+)+\s+[A-Z].*",                             # 1.1. Title
    r"^\s*[IVX]+\.\s+[A-Z].*",                                # I. Title
    r"^[A-Z][A-Z ]{4,}$"                                      # ALL CAPS TITLE
]

# Clause Regex Patterns
CLAUSE_PATTERN_MAIN = r"^\s*\d+(\.\d+)*\s+(?=[A-Z])"          # 1.1 Text
CLAUSE_BULLET_PATTERN = r"^\s*\(?[a-z0-9]+\)\s+"              # (a) Text or 1) Text

def extract_sections(text: str) -> List[Dict[str, Any]]:
    """
    Splits text into sections based on provided regex patterns.
    Returns a list of section dicts: 
    { "title": str, "start": int, "end": int, "text": str }
    """
    lines = text.split('\n')
    sections = []
    
    current_section = {
        "title": "PREAMBLE/UNKNOWN",
        "start": 0,
        "text_buffer": []
    }
    
    current_idx = 0
    
    for line in lines:
        line_len = len(line) + 1 # +1 for newline
        
        # Check if line matches a new section header
        is_new_section = False
        match_title = ""
        
        if line.strip(): # Only check non-empty lines
            for pattern in SECTION_PATTERNS:
                if re.match(pattern, line):
                    is_new_section = True
                    match_title = line.strip()
                    break
        
        if is_new_section:
            # Close previous section
            current_section["end"] = current_idx
            current_section["text"] = "\n".join(current_section["text_buffer"])
            # Only add if it has content or is the preamble
            if current_section["text"].strip() or current_section["title"] != "PREAMBLE/UNKNOWN":
                sections.append(current_section)
            
            # Start new section
            current_section = {
                "title": match_title,
                "start": current_idx,
                "text_buffer": [line]
            }
        else:
            current_section["text_buffer"].append(line)
            
        current_idx += line_len

    # Append absolute last section
    current_section["end"] = current_idx
    current_section["text"] = "\n".join(current_section["text_buffer"])
    if current_section["text"].strip():
        sections.append(current_section)
        
    return sections

def extract_clauses(text: str) -> List[Dict[str, Any]]:
    """
    Inside a section text, split into clauses.
    Returns list of { "clause_number": str, "text": str }
    """
    # Strategy: Identify split points, then slice.
    # Because we need the "clause number" (label), regex split might lose it unless captured.
    
    clauses = []
    lines = text.split('\n')
    
    current_clause = {
        "number": None,
        "text_buffer": []
    }
    
    for line in lines:
        stripped = line.strip()
        if not stripped:
            current_clause["text_buffer"].append(line)
            continue
            
        # Detect start of clause
        match_main = re.match(CLAUSE_PATTERN_MAIN, line)
        match_bullet = re.match(CLAUSE_BULLET_PATTERN, line)
        
        is_new_clause = False
        clause_id = None
        
        if match_main:
            is_new_clause = True
            clause_id = match_main.group().strip()
        elif match_bullet:
            is_new_clause = True
            clause_id = match_bullet.group().strip()
            
        if is_new_clause:
            # Save previous
            if current_clause["text_buffer"]:
                full_text = "\n".join(current_clause["text_buffer"])
                if full_text.strip():
                     clauses.append({"number": current_clause["number"], "text": full_text})
            
            # Start new
            current_clause = {
                "number": clause_id,
                "text_buffer": [line]
            }
        else:
            # Fallback check: Double newline was mentioned, but we are processing line by line.
            # If the current buffer ended with empty lines, maybe? 
            # For now, append to current.
            current_clause["text_buffer"].append(line)

    # Append last
    if current_clause["text_buffer"]:
        full_text = "\n".join(current_clause["text_buffer"])
        if full_text.strip():
            clauses.append({"number": current_clause["number"], "text": full_text})
            
    # Fallback: if no clauses found, return whole text as one 'clause'
    if not clauses and text.strip():
        clauses.append({"number": None, "text": text})
        
    return clauses

def parse_contract(text: str) -> List[Dict[str, Any]]:
    """
    Master function to parse contract into Sections -> Clauses.
    """
    sections = extract_sections(text)
    
    parsed_structure = []
    
    for sec in sections:
        clauses = extract_clauses(sec["text"])
        parsed_structure.append({
            "section_title": sec["title"],
            "section_text": sec["text"],
            "clauses": clauses
        })
        
    return parsed_structure
