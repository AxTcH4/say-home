import os 
from google import genai 
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.document_loaders import PyMuPDFLoader
from langchain_core.documents import Document
import numpy as np
from dotenv import load_dotenv
import uuid 
import re


load_dotenv()

class Embedder:
    def __init__(self):
        self.client = genai.Client(api_key=os.getenv("GOOGLE_GENAI_API_KEY"))
        

    def embedText(self, text: str) -> list[float]:
        response = self.client.models.embed_content(
            model="models/gemini-embedding-001",
            contents=text,
            config={"output_dimensionality": 768}
        )
        return response.embeddings[0].values
    
    def embedDoc(self, doc_path: str) -> list[tuple[str, list[float]]]:

        loader = PyMuPDFLoader(doc_path)
        docs = loader.load()

        print("================== CLEAN DOC ===================")

        clean_docs = []

        for i, page_doc in enumerate(docs):

            text = page_doc.page_content

            # remove page labels
            text = re.sub(r"PAGE\s+\d+\s*:?", "", text, flags=re.IGNORECASE)
            text = re.sub(r"Page\s+\d+", "", text, flags=re.IGNORECASE)

            # normalize spaces
            text = re.sub(r"\s+", " ", text)

            # remove extra spaces
            text = text.strip()

            print(f"PAGE {i}:\n{text}\n\n")

            clean_docs.append(
                Document(
                    page_content=text,
                    metadata=page_doc.metadata
                )
            )

        splitter = RecursiveCharacterTextSplitter(
                chunk_size=650,
                chunk_overlap=80,
                separators=[
                    "ONLINE | ACTION:",
                    "ONSITE | ACTION:",
                    "---",
                    "\n\n",
                    "\n",
                ]
            )
        splitted_docs = splitter.split_documents(clean_docs)

        print("================== SPLITTED DOC ===================")

        for i, chunk in enumerate(splitted_docs):
            print(f"CHUNK {i}:\n{chunk.page_content}\n\n")

        print(f"Chunks: {len(splitted_docs)}")

        return [
            (chunk.page_content, self.embedText(chunk.page_content))
            for chunk in splitted_docs
        ]

    def indexFolder(self, folder_path: str, storage) -> None:
        indexed_sources = set()
        points = storage.client.scroll(collection_name=storage.collection_name, with_payload=True)[0]
        for point in points:
            if point.payload and "source" in point.payload:
                indexed_sources.add(point.payload["source"])
        
        for filename in os.listdir(folder_path):
            if filename.endswith(".pdf"):
                full_path = os.path.join(folder_path, filename)
                if full_path not in indexed_sources:
                    chunks = self.embedDoc(full_path)
                    
                    for i, (text, vector) in enumerate(chunks):
                        storage.upsert(id=str(uuid.uuid4()), vector=vector, payload={"text": text, "source": full_path})
                    print(f"Indexed new doc: {filename}")
                    count = storage.client.count(collection_name="agency_docs")
                    print(count)
                else:
                    print(f"Skipping already indexed: {filename}")