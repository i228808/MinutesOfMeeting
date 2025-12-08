from typing import Optional

def classify_contract_type(text: str) -> str:
    """
    Classifies the contract type based on keyword frequency.
    
    Categories:
    - NDA
    - Employment Agreement
    - Services Agreement
    - Lease
    - Purchase Agreement
    - Vendor Agreement
    """
    text = text.lower()
    
    keywords = {
        "NDA": ["non-disclosure", "confidentiality agreement", "nda", "proprietary information"],
        "Employment Agreement": ["employment agreement", "employment contract", "employee", "offer letter"],
        "Services Agreement": ["master services agreement", "msa", "scope of work", "statement of work", "consulting agreement", "service provider"],
        "Lease": ["lease agreement", "tenant", "landlord", "premises", "rental"],
        "Purchase Agreement": ["purchase agreement", "asset purchase", "sales contract", "buyer", "seller"],
        "Vendor Agreement": ["vendor agreement", "supplier", "vendor", "procurement"]
    }
    
    scores = {key: 0 for key in keywords}
    
    for category, terms in keywords.items():
        for term in terms:
            scores[category] += text.count(term)
            
    # Get the category with the highest score
    best_category = max(scores, key=scores.get)
    
    # If no keywords found at all, return "Other"
    if scores[best_category] == 0:
        return "Other"
        
    return best_category
