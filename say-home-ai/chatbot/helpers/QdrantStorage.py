from qdrant_client.models import PointStruct, VectorParams, Distance 
from qdrant_client import QdrantClient


class QdrantStorage:
    def __init__(self, url="http://localhost:6333", collection_name="agency_docs", dim="768"):
        self.client = QdrantClient(url=url, timeout=30)
        self.collection_name = collection_name

        if not self.client.collection_exists(collection_name):
            self.client.create_collection(
                collection_name=collection_name,
                vectors_config=VectorParams(size=dim, distance=Distance.COSINE),
            )

    def upsert(self, id, vector, payload):
        self.client.upsert(
            collection_name=self.collection_name,
            points=[PointStruct(id=id, vector=vector, payload=payload)]
        )

    def search(self, vector, limit=5, score_threshold=0.5):
        response = self.client.query_points(
            collection_name=self.collection_name,
            query=vector,
            limit=limit,
            score_threshold=score_threshold
        )
        return [resp.payload["text"] for resp in response.points if resp.payload]

    def delete(self, id):
        self.client.delete(
            collection_name=self.collection_name,
            points_selector=[id]
        )