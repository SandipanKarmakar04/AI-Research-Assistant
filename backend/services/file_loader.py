import fitz
import csv

def extract_text(file_path, file_type):
    text = ""

    # PDF
    if file_type == "application/pdf":
        doc = fitz.open(file_path)
        for page in doc:
            text += page.get_text()

    # TXT
    elif file_type == "text/plain":
        with open(file_path, "r", encoding="utf-8") as f:
            text = f.read()
    # CSV
    elif file_type == "text/csv":
        with open(file_path, "r", encoding="utf-8") as f:
            reader = csv.reader(f)
            for row in reader:
                text += " ".join(row) + "\n"

    return text