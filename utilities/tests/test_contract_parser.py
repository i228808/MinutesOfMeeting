from contract_parser import extract_sections, extract_clauses, parse_contract


def test_extract_sections_detects_titles():
    text = "PREAMBLE\n\nSECTION 1. DEFINITIONS\nSome text\n\n2. Scope\nMore"
    sections = extract_sections(text)
    assert len(sections) >= 2
    assert any("SECTION 1" in s["title"] for s in sections)


def test_extract_clauses_fallback_when_none_found():
    clauses = extract_clauses("Just a paragraph with no numbering.")
    assert len(clauses) == 1
    assert clauses[0]["number"] is None


def test_parse_contract_returns_sections_with_clauses():
    parsed = parse_contract("1. TITLE\n1.1 Something\nText")
    assert isinstance(parsed, list)
    assert parsed[0].get("clauses") is not None


def test_extract_clauses_detects_bullets_and_preserves_blank_lines():
    text = "(a) First\n\n(b) Second"
    clauses = extract_clauses(text)
    assert len(clauses) == 2
    assert clauses[0]["number"].startswith("(a)")


def test_extract_sections_handles_final_section_append():
    text = "SECTION 1. TITLE\nBody"
    sections = extract_sections(text)
    assert len(sections) == 1
    assert sections[0]["end"] > sections[0]["start"]


