from fastapi import FastAPI, Form
from pydantic import BaseModel
from database import reviews_collection

app = FastAPI()

class Review(BaseModel):
    product_id: int
    review: str
    rating: int
    
@app.post("/reviews")
def create_review(
    product_id: int = Form(...),
    review_text: str = Form(...),
    rating: int = Form(...)
):
    
    data = {
        "product_id": product_id,
        "review": review_text,
        "rating": rating
    }
    
    
    
    
    # Simpan ke database
    reviews_collection.insert_one(data)
    
    # --- TAMBAHKAN BARIS INI (Perbaikan Error 500) ---
    # Mengubah ObjectId menjadi string agar bisa dibaca Postman
    data["_id"] = str(data["_id"]) 
    # -------------------------------------------------

    return {
        "success": True,
        "message": "Review created successfully",
        "data": data
    }
    
    
    
    
    
    # reviews_collection.insert_one(data)
    # return {
    #     "success": True,
    #     "message": "Review created successfully",
    #     "data": data
    # }
    
        
    

@app.get("/reviews")
def get_reviews():
    reviews = list(reviews_collection.find({}, {"_id": 0}))
    return {
        "success": True,
        "data": reviews
    }

@app.get("/reviews/{product_id}")
def get_reviews_by_product(product_id: int):
    reviews = list(reviews_collection.find({"product_id": product_id}, {"_id": 0}))
    return {
        "success": True,
        "data": reviews
    }