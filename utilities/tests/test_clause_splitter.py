from clause_splitter import split_into_clauses


def test_split_into_clauses_empty():
    assert split_into_clauses("") == []
    assert split_into_clauses(None) == []


def test_split_into_clauses_detects_headers():
    text = (
        "1. Definitions\n"
        "These terms...\n"
        "\n"
        "ARTICLE 2\n"
        "TERM AND TERMINATION\n"
        "This agreement...\n"
    )
    clauses = split_into_clauses(text)
    assert len(clauses) >= 2
    assert clauses[0]["title"].startswith("1.")
    assert "These terms" in clauses[0]["body"]


def test_split_into_clauses_fallback_paragraphs():
    text = "No headers here.\n\nSecond paragraph.\n\nThird."
    clauses = split_into_clauses(text)
    assert [c["title"] for c in clauses] == ["Paragraph 1", "Paragraph 2", "Paragraph 3"]
    assert clauses[1]["body"] == "Second paragraph."


def test_split_into_clauses_handles_leading_blank_lines_and_empty_fallback_paras():
    # Leading blank line covers the "blank while no current clause lines" branch.
    # Multiple blank paragraphs cover the "para is empty" branch in fallback.
    text = "\nJust text.\n\n\nSecond.\n\n"
    clauses = split_into_clauses(text)
    assert len(clauses) == 2


def test_split_into_clauses_header_with_no_body_results_in_no_clauses_appended():
    # Covers end-of-loop path where current_clause_lines is empty.
    clauses = split_into_clauses("1. Definitions\n")
    assert clauses == []


