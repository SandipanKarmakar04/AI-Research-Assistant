from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
import shutil
import os
import uuid
from services.file_loader import extract_text
from rag.chunker import chunk_text
from rag.vector_store import *
from langchain_community.vectorstores import Chroma
from services.llm_service import generate_answer
from database import chat_collection, sessions_collection
from pydantic import BaseModel
from bson import ObjectId
from datetime import datetime


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
class QuestionRequest(BaseModel):
    question: str
    session_id: str | None = None

@app.post("/ask")
def ask_question(data: QuestionRequest):
    
    question = data.question
    session_id = data.session_id

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

@app.post("/sessions")
def create_session():
    session = {
        "title": "New Chat",
        "createdAt": datetime.utcnow()
    }

    result = sessions_collection.insert_one(session)

    return {
        "sessionId": str(result.inserted_id),
        "title": session["title"]
    }

@app.get("/sessions")
def get_sessions():

    sessions = []

    for s in sessions_collection.find().sort("createdAt", -1):
        sessions.append({
            "id": str(s["_id"]),
            "title": s["title"],
            "createdAt": s["createdAt"]
        })

    return sessions


@app.get("/sessions/{session_id}/messages")
def get_messages(session_id: str):

    messages = chat_collection.find(
        {"session_id": session_id}
    ).sort("timestamp",1)

    result = []
    for m in messages:
        result.append({
            "role": m["role"],
            "content": m["content"]
        })

    return result

@app.post("/chat")
def chat(data: dict):

    session_id = data["sessionId"]
    user_message = data["message"]

    # 🔥 update title if still "New Chat"
    # sessions_collection.update_one (
    #     {
    #         "_id": ObjectId(session_id),
    #         "title": "New Chat"
    #     },
    #     {
    #         "$set": {
    #         "title": user_message[:30]
    #         }
    #     }
    # )

    # save user message
    chat_collection.insert_one({
        "session_id": session_id,
        "role": "user",
        "content": user_message,
        "timestamp": datetime.utcnow()
    })

    # 🔥 STEP 1: get relevant context from vector DB
    db = Chroma(
        persist_directory="chroma_db",
        embedding_function=embedding_model
    )

    results = db.similarity_search(user_message, k=3)

    context = "\n".join([r.page_content for r in results])

    # 🔥 STEP 2: REAL AI response
    bot_reply = generate_answer(context, user_message)

    # save assistant message
    chat_collection.insert_one({
        "session_id": session_id,
        "role": "assistant",
        "content": bot_reply,
        "timestamp": datetime.utcnow()
    })

    return {
        "reply": bot_reply
    }



app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
