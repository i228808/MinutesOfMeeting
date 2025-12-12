from chunker import get_token_count, chunk_text_semantically, create_hierarchical_chunks


def test_get_token_count_nonzero_for_text():
    assert get_token_count("hello world") > 0


def test_chunk_text_semantically_returns_multiple_chunks_with_overlap():
    text = "A " * 5000  # big enough to force multiple chunks
    chunks = chunk_text_semantically(text, max_tokens=50, overlap=10)
    assert len(chunks) > 1
    # Each chunk should be non-empty
    assert all(isinstance(c, str) and c.strip() for c in chunks)


def test_chunk_text_semantically_empty_text():
    assert chunk_text_semantically("", max_tokens=10, overlap=2) == []


def test_create_hierarchical_chunks_level1_and_level2():
    parsed = [
        {
            "section_title": "Section 1",
            "section_text": "This is section text. " * 200,
            "clauses": [
                {"number": "1.1", "text": "Clause one text. " * 30},
                {"number": "1.2", "text": "Clause two text. " * 30},
            ],
        }
    ]
    chunks = create_hierarchical_chunks(parsed, filename="doc1")
    assert any(c["chunk_level"] == 1 for c in chunks)
    assert any(c["chunk_level"] == 2 for c in chunks)
    assert all(c["document_id"] == "doc1" for c in chunks)


def test_create_hierarchical_chunks_flushes_when_clause_buffer_exceeds_limit():
    # Force count > 350 with an existing buffer so the flush branch executes.
    parsed = [
        {
            "section_title": "Sec",
            "section_text": "x",
            "clauses": [
                {"number": "1.1", "text": "A " * 500},
                {"number": "1.2", "text": "B " * 500},
            ],
        }
    ]
    chunks = create_hierarchical_chunks(parsed, filename="doc-flush")
    level1 = [c for c in chunks if c["chunk_level"] == 1]
    assert len(level1) >= 2


def test_create_hierarchical_chunks_splits_large_section_into_parts():
    parsed = [
        {
            "section_title": "BigSection",
            "section_text": "This is a long section. " * 5000,
            "clauses": [{"number": "1.1", "text": "short clause"} , {"number": "1.2", "text": "short clause"}],
        }
    ]
    chunks = create_hierarchical_chunks(parsed, filename="doc-big")
    level2_parts = [c for c in chunks if c["chunk_level"] == 2 and c["clause_number"] == "SECTION_PART"]
    assert len(level2_parts) >= 2


def test_create_hierarchical_chunks_no_clauses_in_multiple_sections_does_not_append_level1():
    parsed = [
        {"section_title": "S1", "section_text": "x", "clauses": []},
        {"section_title": "S2", "section_text": "y", "clauses": []},
    ]
    chunks = create_hierarchical_chunks(parsed, filename="doc-empty-clauses")
    assert all(c["chunk_level"] != 1 for c in chunks)


def test_create_hierarchical_chunks_fallback_level3():
    parsed = [{"section_title": "Preamble", "section_text": "Hello world. " * 300, "clauses": []}]
    chunks = create_hierarchical_chunks(parsed, filename="doc2")
    assert any(c["chunk_level"] == 3 for c in chunks)
    assert all(c["section"] == "Fallback" for c in chunks)


