from fastapi import FastAPI
from pydantic import BaseModel
from database import reviews_collection
from bson import ObjectId

app = FastAPI()

# --- 1. UPDATE MODEL AGAR COCOK DENGAN FLUTTER ---
# Flutter mengirim JSON: {"product_id": 2, "user_id": 6, "rating": 3, "review_text": "..."}
# Maka Pydantic model harus sama persis key-nya.
class ReviewModel(BaseModel):
    product_id: int
    user_id: int       # Tambahkan ini karena Flutter mengirim user_id
    rating: int
    review_text: str   # Ganti 'review' jadi 'review_text' sesuai JSON Flutter

@app.get("/")
def read_root():
    return {"message": "Review Service is running"}

# --- 2. UBAH POST METHOD MENERIMA JSON BODY ---
@app.post("/reviews")
def create_review(review: ReviewModel): # Jangan pakai Form(...), pakai Model
    
    # Konversi data dari Model ke Dictionary untuk MongoDB
    data = {
        "product_id": review.product_id,
        "user_id": review.user_id,
        "rating": review.rating,
        "review": review.review_text # Di database kita simpan sebagai 'review'
    }
    
    # Simpan ke database
    result = reviews_collection.insert_one(data)
    
    # Mengubah ObjectId menjadi string agar bisa dibaca response JSON
    data["_id"] = str(result.inserted_id)

    return {
        "success": True,
        "message": "Review created successfully",
        "data": data
    }
    
# --- TAMBAHKAN INI UNTUK FITUR EDIT (PUT) ---
@app.put("/reviews/{review_id}")
def update_review(review_id: str, review: ReviewModel):
    # 1. Cek validitas ObjectId
    if not ObjectId.is_valid(review_id):
        return {"success": False, "message": "Invalid ID format"}
    
    # 2. Siapkan data update
    # Kita map 'review_text' dari Flutter ke kolom 'review' di MongoDB
    update_data = {
        "rating": review.rating,
        "review": review.review_text, 
        "product_id": review.product_id, # Tetap simpan biar data konsisten
        "user_id": review.user_id
    }

    # 3. Lakukan Update di MongoDB
    result = reviews_collection.update_one(
        {"_id": ObjectId(review_id)}, 
        {"$set": update_data}
    )

    if result.matched_count == 0:
        return {"success": False, "message": "Review not found"}

    return {
        "success": True,
        "message": "Review updated successfully"
    }

@app.get("/reviews")
def get_reviews():
    # Ambil semua data, ubah _id jadi string
    reviews_cursor = reviews_collection.find({})
    reviews = []
    for doc in reviews_cursor:
        doc["_id"] = str(doc["_id"])
        # Handle field name jaga-jaga (kadang review, kadang review_text di db lama)
        if "review_text" not in doc and "review" in doc:
             doc["review_text"] = doc["review"]
        reviews.append(doc)
        
    return {
        "success": True,
        "data": reviews
    }

@app.get("/reviews/{product_id}")
def get_reviews_by_product(product_id: int):
    reviews_cursor = reviews_collection.find({"product_id": product_id})
    reviews = []
    for doc in reviews_cursor:
        doc["_id"] = str(doc["_id"])
        # Mapping agar Flutter tidak bingung baca fieldnya
        if "review" in doc:
            doc["review_text"] = doc["review"] 
        reviews.append(doc)
        
    return {
        "success": True,
        "data": reviews
    }
    
    
# --- TAMBAHKAN INI UNTUK FITUR DELETE ---
@app.delete("/reviews/{review_id}")
def delete_review(review_id: str):
    # 1. Cek validitas ID
    if not ObjectId.is_valid(review_id):
        return {"success": False, "message": "Invalid ID format"}
    
    # 2. Hapus dari database
    result = reviews_collection.delete_one({"_id": ObjectId(review_id)})
    
    # 3. Cek apakah ada yang terhapus
    if result.deleted_count == 0:
        return {"success": False, "message": "Review not found"}
        
    return {"success": True, "message": "Review deleted successfully"}