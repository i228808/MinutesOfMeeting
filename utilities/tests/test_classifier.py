from classifier import classify_contract_type


def test_classifier_other_when_no_keywords():
    assert classify_contract_type("hello world") == "Other"


def test_classifier_detects_nda():
    assert classify_contract_type("This is a Non-Disclosure agreement and confidentiality agreement.") == "NDA"


