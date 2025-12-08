import weaviate
from weaviate.classes.config import Property, DataType, Configure
from typing import List, Dict, Any
import os

def get_client():
    # Connect to local Weaviate
    # User specified http://localhost:8080
    return weaviate.connect_to_local(
        port=8081,
        grpc_port=50052
    )

def initialize_schema():
    """
    Ensures the 'ContractChunk' class exists with the correct properties.
    """
    client = get_client()
    try:
        class_name = "ContractChunk"
        
        # Check if class exists
        if not client.collections.exists(class_name):
            print(f"Creating class {class_name}...")
            client.collections.create(
                name=class_name,
                properties=[
                    Property(name="text", data_type=DataType.TEXT),
                    Property(name="document_id", data_type=DataType.TEXT),
                    Property(name="section", data_type=DataType.TEXT),
                    Property(name="clause_number", data_type=DataType.TEXT),
                    Property(name="chunk_level", data_type=DataType.INT), # 1, 2, or 3
                    Property(name="contract_type", data_type=DataType.TEXT),
                ],
                # We are bringing our own vectors, so we might not need to configure a vectorizer 
                # strictly if we use the underlying client to insert vectors directly.
                # But explicitly setting it to none is good practice if we provide vectors.
                vectorizer_config=Configure.Vectorizer.none() 
            )
            print(f"Class {class_name} created.")
        else:
            print(f"Class {class_name} already exists.")
            
    except Exception as e:
        print(f"Error initializing schema: {e}")
    finally:
        client.close()

def batch_insert_chunks(chunks: List[Dict[str, Any]]):
    """
    Batches inserts chunks into Weaviate with their vectors.
    """
    client = get_client()
    
    try:
        collection = client.collections.get("ContractChunk")
        
        with collection.batch.dynamic() as batch:
            for chunk in chunks:
                if not chunk.get("vector"):
                    print(f"Skipping chunk without vector: {chunk.get('document_id')}")
                    continue
                
                # Prepare properties
                properties = {
                    "text": chunk["text"],
                    "document_id": chunk["document_id"],
                    "section": chunk.get("section", ""),
                    "clause_number": chunk.get("clause_number", ""),
                    "chunk_level": chunk["chunk_level"],
                    "contract_type": chunk.get("contract_type", "Unknown")
                }
                
                batch.add_object(
                    properties=properties,
                    vector=chunk["vector"] 
                )
                
        if len(client.batch.failed_objects) > 0:
            print(f"Failed to insert {len(client.batch.failed_objects)} objects.")
            for failed in client.batch.failed_objects[:5]:
                print(f"Error: {failed}")
        else:
            print(f"Successfully inserted {len(chunks)} chunks.")

    except Exception as e:
        print(f"Error inserting batches: {e}")
    finally:
        client.close()
