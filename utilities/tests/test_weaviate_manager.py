import sys
import types


def test_initialize_schema_and_batch_insert_chunks_with_mocked_weaviate(monkeypatch):
    # Minimal fake weaviate + config types used by weaviate_manager
    class FakeCollections:
        def __init__(self, exists=False):
            self._exists = exists

        def exists(self, name):
            return self._exists

        def create(self, **kwargs):
            self._exists = True

        def get(self, name):
            return FakeCollection()

    class FakeBatch:
        def __init__(self, failed=None):
            self.failed_objects = failed or []

    class FakeClient:
        def __init__(self, exists=False, failed=None):
            self.collections = FakeCollections(exists=exists)
            self.batch = FakeBatch(failed=failed)

        def close(self):
            pass

    class FakeDynamicBatchCtx:
        def __enter__(self):
            return self

        def __exit__(self, exc_type, exc, tb):
            return False

        def add_object(self, properties=None, vector=None):
            return None

    class FakeCollection:
        class batch:
            @staticmethod
            def dynamic():
                return FakeDynamicBatchCtx()

    fake_weaviate = types.SimpleNamespace(connect_to_local=lambda **kwargs: FakeClient())
    fake_config = types.SimpleNamespace(
        Property=lambda **kwargs: kwargs,
        DataType=types.SimpleNamespace(TEXT="text", INT="int"),
        Configure=types.SimpleNamespace(Vectorizer=types.SimpleNamespace(none=lambda: None)),
    )

    # Provide nested import paths: weaviate.classes.config
    monkeypatch.setitem(sys.modules, "weaviate", fake_weaviate)
    monkeypatch.setitem(sys.modules, "weaviate.classes", types.SimpleNamespace(config=fake_config))
    monkeypatch.setitem(sys.modules, "weaviate.classes.config", fake_config)

    import importlib

    wm = importlib.import_module("weaviate_manager")
    importlib.reload(wm)

    wm.initialize_schema()
    wm.batch_insert_chunks([{"text": "x", "document_id": "d", "chunk_level": 1, "vector": [0.1]}])


def test_batch_insert_chunks_skips_missing_vector_and_reports_failed_objects(monkeypatch):
    import sys
    import types
    import importlib

    class FakeCollections:
        def exists(self, name):
            return True

        def get(self, name):
            return FakeCollection()

    class FakeBatch:
        def __init__(self):
            self.failed_objects = ["fail1"]

    class FakeClient:
        def __init__(self):
            self.collections = FakeCollections()
            self.batch = FakeBatch()

        def close(self):
            pass

    class FakeDynamicBatchCtx:
        def __enter__(self):
            return self

        def __exit__(self, exc_type, exc, tb):
            return False

        def add_object(self, properties=None, vector=None):
            return None

    class FakeCollection:
        class batch:
            @staticmethod
            def dynamic():
                return FakeDynamicBatchCtx()

    fake_weaviate = types.SimpleNamespace(connect_to_local=lambda **kwargs: FakeClient())
    fake_config = types.SimpleNamespace(
        Property=lambda **kwargs: kwargs,
        DataType=types.SimpleNamespace(TEXT="text", INT="int"),
        Configure=types.SimpleNamespace(Vectorizer=types.SimpleNamespace(none=lambda: None)),
    )
    monkeypatch.setitem(sys.modules, "weaviate", fake_weaviate)
    monkeypatch.setitem(sys.modules, "weaviate.classes", types.SimpleNamespace(config=fake_config))
    monkeypatch.setitem(sys.modules, "weaviate.classes.config", fake_config)

    wm = importlib.import_module("weaviate_manager")
    importlib.reload(wm)

    wm.batch_insert_chunks([
        {"text": "skip", "document_id": "d", "chunk_level": 1},  # no vector
        {"text": "ok", "document_id": "d2", "chunk_level": 1, "vector": [0.1]},
    ])


