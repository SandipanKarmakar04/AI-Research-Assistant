from fastapi import FastAPI, UploadFile, File
import shutil
import os
import uuid
from services.file_loader import extract_text
from rag.chunker import chunk_text
from rag.vector_store import *
from langchain_community.vectorstores import Chroma
from services.llm_service import generate_answer
from database import chat_collection


app = FastAPI()

UPLOAD_FOLDER = "uploads"

os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# MIME (Multipurpose Internet Mail Extensions) Types
ALLOWED_TYPES = [
    "application/pdf",
    "text/plain",
    "text/csv"
]

@app.get("/")
def home():
    return {
        "message": "AI Research Assistant Backend Running"
    }

from langchain_community.vectorstores import Chroma

@app.get("/search")
def search(query: str):

    db = Chroma(
        persist_directory="chroma_db",
        embedding_function=embedding_model
    )

    results = db.similarity_search(query, k=3)

    return {
        "query": query,
        "results": [
            {
                "content": r.page_content,
                "metadata": r.metadata
            }
            for r in results
        ]
    }

@app.post("/upload")
async def upload_file(file: UploadFile = File(...)):

    if file.content_type not in ALLOWED_TYPES:
        return {
            "error": "Invalid file type",
            "allowed_types": ["pdf", "txt", "csv"]
        }

    file_path = f"{UPLOAD_FOLDER}/{file.filename}"

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    extracted_text = extract_text(file_path, file.content_type)
    chunks = chunk_text(extracted_text)

    store_in_vector_db(chunks)

    return {
        "filename": file.filename,
        "text_length": len(extracted_text),
        "message": "PDF uploaded and text extracted successfully",
        "total_chunks": len(chunks)
    }

@app.post("/ask")
def ask_question(question: str, session_id: str = None):

    if session_id is None:
        session_id = str(uuid.uuid4())

    db = Chroma(
        persist_directory="chroma_db",
        embedding_function=embedding_model
    )

    results = db.similarity_search(question, k=3)

    context = "\n".join(
        [result.page_content for result in results]
    )

    answer = generate_answer(context, question)

    chat_collection.insert_one({
         "session_id": session_id,
        "question": question,
        "answer": answer
    })

    return {
        "session_id": session_id,
        "question": question,
        "answer": answer
    }

@app.get("/chat-history")
def get_chat_history(session_id: str):

    chats = list(
        chat_collection.find(
            {"session_id": session_id},
            {"_id": 0}
        )
    )

    return {
        "session_id": session_id,
        "chat_history": chats
    }