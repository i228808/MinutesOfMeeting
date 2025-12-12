import re
from typing import List, Dict

def split_into_clauses(text: str) -> List[Dict[str, str]]:
    """
    Splits contract text into clauses based on section headers or paragraphs.
    
    Args:
        text: The raw input text string.
        
    Returns:
        A list of dictionaries with 'title' and 'body'.
    """
    if not text:
        return []

    clauses = []
    lines = text.split('\n')
    
    # Regex patterns
    # 1. Numbered headers: "1. Definitions", "2.1. Scope", "3.4.2 Title"
    # Allow an optional trailing period after the number (e.g. "1. Definitions").
    header_regex = re.compile(r"^\d+(\.\d+)*\.?\s+[A-Z][A-Za-z].+")
    
    # 2. Numbered clauses start: "1.", "2.1" (without necessarily text following immediately on same line)
    # This captures the start of a numbered list item
    numbered_clause_start = re.compile(r"^\d+(\.\d+)*\.?$") 

    # 3. All-caps titles: "ARTICLE 1", "DEFINITIONS", assuming reasonable length (3-50 chars)
    # Avoids matching short acronyms in text or very long lines
    all_caps_title = re.compile(r"^[A-Z\d\s\W]{3,50}$")

    current_clause_title = "Preamble/Introduction" # Default start
    current_clause_lines = []
    
    # Heuristic to detect if we are extracting structured headers at all
    headers_found = False

    for line in lines:
        stripped_line = line.strip()
        if not stripped_line:
            # Keep blank lines if we are inside a clause, or ignore?
            # Usually we want to preserve paragraph structure within a clause.
            if current_clause_lines:
                current_clause_lines.append(line)
            continue

        is_header = False
        match_title = ""

        # Check for specific header patterns
        if header_regex.match(stripped_line):
            is_header = True
            match_title = stripped_line
        elif all_caps_title.match(stripped_line) and any(c.isupper() for c in stripped_line): 
             # Ensure at least some letters, not just "123"
            is_header = True
            match_title = stripped_line
        
        if is_header:
            headers_found = True
            # Save previous clause if it has content
            if current_clause_lines:
                body_text = "\n".join(current_clause_lines).strip()
                if body_text:  # pragma: no branch
                     clauses.append({
                        "title": current_clause_title,
                        "body": body_text
                    })
            
            # Start new clause
            current_clause_title = match_title
            current_clause_lines = [] # Reset lines, header is the title
        else:
            current_clause_lines.append(line)

    # Append the last clause
    if current_clause_lines:
        body_text = "\n".join(current_clause_lines).strip()
        if body_text:  # pragma: no branch
            clauses.append({
                "title": current_clause_title,
                "body": body_text
            })

    # Fallback: If essentially no headers were found (only Preamble), 
    # and the text is long, maybe splitting by paragraphs is better?
    # For now, per requirements: "If no header is detected, treat paragraphs as fallback clauses."
    
    # Refined Logic: If we only have 1 clause (Preamble) and it's huge, split it.
    if len(clauses) <= 1 and not headers_found:
        # Fallback split by blank lines
        raw_paragraphs = re.split(r'\n\s*\n', text)
        fallback_clauses = []
        for i, para in enumerate(raw_paragraphs):
            para = para.strip()
            if para:
                fallback_clauses.append({
                    "title": f"Paragraph {i+1}",
                    "body": para
                })
        return fallback_clauses

    return clauses

if __name__ == "__main__":  # pragma: no cover
    # Test cases
    test_text_headers = """
1. Definitions
The following terms shall have the meanings set forth below.

1.1. Agreement
This contract between Party A and Party B.

ARTICLE 2
TERM AND TERMINATION
This agreement shall last for 1 year.

3. Payment. 
Payment checks should be mailed.
    """

    test_text_fallback = """
This is a contract with no clear headers.
    
It just has paragraphs.
    
Some weird formatting maybe.
    """
    
    print("--- Test 1: Headers ---")
    results = split_into_clauses(test_text_headers)
    for c in results:
        print(f"Title: {c['title']}")
        print(f"Body: {c['body'][:50]}...") # Print first 50 chars
        print("-" * 20)

    print("\n--- Test 2: Fallback ---")
    results_fallback = split_into_clauses(test_text_fallback)
    for c in results_fallback:
        print(f"Title: {c['title']}")
        print(f"Body: {c['body'][:50]}...")
        print("-" * 20)
