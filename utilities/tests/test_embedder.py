import sys
import types


def test_generate_embeddings_with_mocked_sentence_transformers(monkeypatch):
    # Mock sentence_transformers before importing embedder
    class FakeModel:
        def encode(self, texts, batch_size=512, convert_to_numpy=True):
            class FakeArr:
                def __init__(self, n):
                    self._n = n

                def tolist(self):
                    return [0.1, 0.2, 0.3]

            return [FakeArr(i) for i in range(len(texts))]

    fake_st = types.SimpleNamespace(SentenceTransformer=lambda *a, **k: FakeModel())
    monkeypatch.setitem(sys.modules, "sentence_transformers", fake_st)

    import importlib

    embedder = importlib.import_module("embedder")
    importlib.reload(embedder)

    chunks = [{"text": "a"}, {"text": "b"}]
    out = embedder.generate_embeddings(chunks)
    assert out[0]["vector"] == [0.1, 0.2, 0.3]


def test_generate_embeddings_empty_chunks(monkeypatch):
    import importlib
    embedder = importlib.import_module("embedder")
    assert embedder.generate_embeddings([]) == []


def test_generate_embeddings_handles_encode_error(monkeypatch):
    import sys
    import types
    import importlib

    class FakeModel:
        def encode(self, *a, **k):
            raise RuntimeError("encode failed")

    fake_st = types.SimpleNamespace(SentenceTransformer=lambda *a, **k: FakeModel())
    monkeypatch.setitem(sys.modules, "sentence_transformers", fake_st)

    embedder = importlib.import_module("embedder")
    importlib.reload(embedder)

    chunks = [{"text": "a"}]
    out = embedder.generate_embeddings(chunks)
    # Should return chunks unchanged (no vector added) on error
    assert "vector" not in out[0]


