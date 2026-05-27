from pymongo import MongoClient

client = MongoClient("mongodb://localhost:27017")

db = client["ai_research_assistant"]

chat_collection = db["chat_history"]