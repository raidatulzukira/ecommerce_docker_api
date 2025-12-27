from pymongo import MongoClient
import os 
import time
MONGO_URI= os.getenv("MONGO_URI", "mongodb://admin:admin123@mongo:27017/")
def connect_with_retry():
    retries = 5
    while retries:
        try:
            client = MongoClient(MONGO_URI)
            # The ismaster command is cheap and does not require auth.
            client.admin.command('ping')
            print("Connected to MongoDB")
            return client
        except Exception as e:
            print(f"MongoDB connection failed: {e}")
            retries -= 1
            time.sleep(5)
    raise Exception("Could not connect to MongoDB after several attempts")

client = connect_with_retry()
db = client[os.getenv("MONGO_DB_NAME", "reviewdb")]
reviews_collection = db["reviews"]