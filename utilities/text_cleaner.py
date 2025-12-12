import re

def clean_contract_text(text: str) -> str:
    """
    Cleans and normalizes contract text by handling ligatures, headers/footers,
    whitespace, and bullet points.
    
    Args:
        text: The raw input text string.
        
    Returns:
        The cleaned text string.
    """
    if not text:
        return ""

    # 1. Expand ligatures
    ligatures = {
        'ﬁ': 'fi', 'ﬂ': 'fl', 'ﬀ': 'ff', 'ﬃ': 'ffi', 'ﬄ': 'ffl',
        'ﬅ': 'ft', 'ﬆ': 'st', 'Ꜳ': 'AA', 'Æ': 'AE', 'ꜳ': 'aa', 'æ': 'ae',
        'Œ': 'OE', 'œ': 'oe'
    }
    for search, replace in ligatures.items():
        text = text.replace(search, replace)

    # 2. Normalize whitespace characters (turns non-breaking spaces into normal spaces)
    text = text.replace(u'\xa0', u' ')

    # 3. Remove headers/footers like "Page 7 of 32" or "Page 7" at the start/end of lines
    # Case insensitive, matching "Page X of Y" or just "Page X" if it's on a standalone line
    text = re.sub(r'(?i)^\s*Page\s+\d+\s+of\s+\d+\s*$', '', text, flags=re.MULTILINE)
    text = re.sub(r'(?i)^\s*Page\s+\d+\s*$', '', text, flags=re.MULTILINE)

    # 4. Normalize bullets
    # Replace various bullet characters with a standard hyphen
    text = re.sub(r'[\u2022\u2023\u25E6\u2043\u2219]', '- ', text)
    
    # 5. Remove multiple horizontal spaces (but preserve newlines)
    # [ \t]+ matches one or more spaces or tabs, excludes \n
    text = re.sub(r'[ \t]+', ' ', text)

    # 6. Remove excessive newlines
    # Collapse 3 or more newlines into 2 (one empty line between paragraphs)
    text = re.sub(r'\n{3,}', '\n\n', text)
    
    # Trim leading/trailing whitespace
    return text.strip()

if __name__ == "__main__":  # pragma: no cover
    # Test cases
    raw_sample = """
    This is a sample text with ligatures: ﬁrst, ﬂower.
    
    Page 1 of 10
    
    It has   multiple    spaces.
    • Bullet point 1
    • Bullet point 2
    
    
    
    This paragraph is separated by too many newlines.
    Page 2
    """
    
    print("Original Text:")
    print(repr(raw_sample))
    print("\n--- Cleaned Text ---")
    cleaned = clean_contract_text(raw_sample)
    print(repr(cleaned))
