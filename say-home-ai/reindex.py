from chatbot.helpers.Embedder import Embedder
from chatbot.helpers.QdrantStorage import QdrantStorage

storage = QdrantStorage()
storage.client.delete_collection(storage.collection_name)
print("Collection deleted")

# recreate
storage = QdrantStorage()  # __init__ will recreate it
print("Collection recreated")

embedder = Embedder()
embedder.indexFolder("docs/", storage)
print("Done!")