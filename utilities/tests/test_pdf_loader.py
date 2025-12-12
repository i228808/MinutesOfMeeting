import sys
import types
import os


def test_load_pdfs_from_folder_with_mocked_pdfium(tmp_path, monkeypatch):
    # Create fake PDF path
    pdf_path = tmp_path / "a.pdf"
    pdf_path.write_bytes(b"%PDF-1.4")

    # Mock os.walk to return the pdf
    monkeypatch.setattr(os, "walk", lambda root: [(str(tmp_path), [], ["a.pdf", "b.txt"])])

    # Mock pypdfium2 module and PdfDocument
    class FakeTextPage:
        def get_text_range(self):
            return "hello"

    class FakePage:
        def get_textpage(self):
            return FakeTextPage()

    class FakePdf:
        def __len__(self):
            return 1

        def __getitem__(self, idx):
            return FakePage()

        def close(self):
            pass

    fake_pdfium = types.SimpleNamespace(PdfDocument=lambda path: FakePdf())
    monkeypatch.setitem(sys.modules, "pypdfium2", fake_pdfium)

    import importlib

    pdf_loader = importlib.import_module("pdf_loader")
    importlib.reload(pdf_loader)

    docs = pdf_loader.load_pdfs_from_folder(str(tmp_path))
    assert len(docs) == 1
    assert docs[0]["path"].endswith("a.pdf")
    assert "hello" in docs[0]["text"]


def test_load_pdfs_from_folder_handles_extraction_error(tmp_path, monkeypatch):
    pdf_path = tmp_path / "a.pdf"
    pdf_path.write_bytes(b"%PDF-1.4")

    monkeypatch.setattr(os, "walk", lambda root: [(str(tmp_path), [], ["a.pdf"])])

    class FakePdfBroken:
        def __init__(self, path):
            raise RuntimeError("boom")

    fake_pdfium = types.SimpleNamespace(PdfDocument=FakePdfBroken)
    monkeypatch.setitem(sys.modules, "pypdfium2", fake_pdfium)

    import importlib

    pdf_loader = importlib.import_module("pdf_loader")
    importlib.reload(pdf_loader)

    docs = pdf_loader.load_pdfs_from_folder(str(tmp_path))
    assert docs == []


