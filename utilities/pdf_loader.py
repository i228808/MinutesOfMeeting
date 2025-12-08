import os
import pypdfium2 as pdfium
from typing import List, Dict

def load_pdfs_from_folder(root_folder: str) -> List[Dict[str, str]]:
    """
    Recursively walks the folder and extracts text from every PDF found using pypdfium2.
    
    Args:
        root_folder: The path to the root folder containing PDFs.
        
    Returns:
        A list of dictionaries, each containing 'path' and 'text' of a PDF.
    """
    pdf_docs = []
    
    for root, dirs, files in os.walk(root_folder):
        for file in files:
            if file.lower().endswith(".pdf"):
                file_path = os.path.join(root, file)
                try:
                    pdf = pdfium.PdfDocument(file_path)
                    text = ""
                    for i in range(len(pdf)):
                        page = pdf[i]
                        text_page = page.get_textpage()
                        extracted_text = text_page.get_text_range()
                        # text_page.close() # automatic in newer versions, but good practice if needed
                        if extracted_text:
                            text += extracted_text + "\n"
                            
                    pdf.close()
                    
                    if text.strip(): 
                        pdf_docs.append({
                            "path": file_path,
                            "text": text
                        })
                        print(f"Successfully loaded: {file_path}")
                    else:
                        print(f"Warning: No text extracted from {file_path}")

                except Exception as e:
                    print(f"Error loading {file_path}: {e}")
                    continue

    return pdf_docs

if __name__ == "__main__":
    script_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.dirname(script_dir)
    rag_data_path = os.path.join(project_root, "RAG_DATA")
    
    if os.path.exists(rag_data_path):
        print(f"Scanning {rag_data_path}...")
        docs = load_pdfs_from_folder(rag_data_path)
        print(f"Total documents loaded: {len(docs)}")
        for doc in docs[:5]:
            print(f"- {doc['path']}")
    else:
        print(f"Error: RAG_DATA folder not found at {rag_data_path}")
