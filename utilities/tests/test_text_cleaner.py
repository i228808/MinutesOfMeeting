from text_cleaner import clean_contract_text


def test_clean_contract_text_empty():
    assert clean_contract_text("") == ""
    assert clean_contract_text(None) == ""


def test_clean_contract_text_ligatures_headers_bullets():
    raw = (
        "This has ligatures: ﬁrst ﬂower.\n"
        "Page 1 of 10\n"
        "• Bullet one\n"
        "\n"
        "\n"
        "\n"
        "Page 2\n"
        "End.\n"
    )
    cleaned = clean_contract_text(raw)
    assert "first flower" in cleaned
    assert "Page 1 of 10" not in cleaned
    assert "\n\n\n" not in cleaned
    assert "-  Bullet one" in cleaned or "- Bullet one" in cleaned


