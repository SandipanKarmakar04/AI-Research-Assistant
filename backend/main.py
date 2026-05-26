from fastapi import FastAPI, UploadFile, File
import shutil
import os
from services.pdf_loader import extract_text_from_pdf
from rag.chunker import chunk_text
from rag.vector_store import store_in_vector_db

app = FastAPI()

UPLOAD_FOLDER = "uploads"

os.makedirs(UPLOAD_FOLDER, exist_ok=True)

@app.get("/")
def home():
    return {
        "message": "AI Research Assistant Backend Running"
    }

@app.post("/upload")
async def upload_file(file: UploadFile = File(...)):

    file_path = f"{UPLOAD_FOLDER}/{file.filename}"

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    extracted_text = extract_text_from_pdf(file_path)
    chunks = chunk_text(extracted_text)

    store_in_vector_db(chunks)


    return {
        "filename": file.filename,
        "text_length": len(extracted_text),
        "message": "PDF uploaded and text extracted successfully",
        "total_chunks": len(chunks)
    }