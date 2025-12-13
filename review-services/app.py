from flask import Flask, jsonify, request

app = Flask(__name__)

# Dummy data for reviews
reviews = [
    {"id": 1, "product_id": 101, "review": "Great product!", "rating": 5},
    {"id": 2, "product_id": 102, "review": "Not bad", "rating": 3},
    {"id": 3, "product_id": 103, "review": "Could be better", "rating": 2},
    {"id": 4, "product_id": 104, "review": "Excellent", "rating": 4},
    {"id": 5, "product_id": 105, "review": "Average", "rating": 3},
    {"id": 6, "product_id": 106, "review": "Great product!", "rating": 5},
    {"id": 7, "product_id": 107, "review": "Not bad", "rating": 3}
]

@app.route('/', methods=['GET'])
def home():
    return jsonify("message: Welcome to the Review Service")

# Get /reviews -> semua reviews
@app.route('/reviews', methods=['GET'])
def get_reviews():
    return jsonify(reviews)

# Get /review product -> review berdasarkan product_id
@app.route('/reviews/<int:review_id>', methods=['GET'])
def get_reviews_by_product(review_id):
    review = next ((r for r in reviews if r['id'] == review_id), None)
    if review is None:
        return jsonify({"message": "Review not found"}), 404
    return jsonify(review)
    
# Get review product by id
@app.route('/reviews/product/<int:product_id>', methods=['GET'])
def get_review_product_by_product_id(product_id):
    filtered_reviews = [r for r in reviews if r['product_id'] == product_id]
    return jsonify(filtered_reviews)

# Tambah review baru
@app.route('/reviews', methods=['POST'])
# def create_review():
    
#     data = request.get_json() or {}
    
#     required_fields = ['product_id', 'review', 'rating']
#     missing = [f for f in required_fields if f not in data]
#     if missing:
#         return jsonify({"message": f"Missing fields: {', '.join(missing)}", }), 400
    
#     new_id = len(reviews) + 1
#     new_review = {
#         "id": new_id,
#         "product_id": int(data["product_id"]),
#         "review": data["review"],
#         "rating": int(data["rating"])
#     }

#     reviews.append(new_review)
#     return jsonify(new_review), 201

def create_review():
    # --- BAGIAN INI YANG DIUBAH ---
    
    # 1. Coba ambil data JSON (silent=True mencegah error jika format header salah)
    data = request.get_json(silent=True)
    
    # 2. Jika data JSON kosong, ambil dari Form Data (x-www-form-urlencoded)
    if not data:
        data = request.form
        
    # 3. Jika masih kosong (tidak ada data sama sekali)
    if not data:
        return jsonify({"message": "No input data provided"}), 400
    
    # ------------------------------

    required_fields = ['product_id', 'review', 'rating']
    missing = [f for f in required_fields if f not in data]
    if missing:
        return jsonify({"message": f"Missing fields: {', '.join(missing)}", }), 400
    
    new_id = len(reviews) + 1
    new_review = {
        "id": new_id,
        "product_id": int(data["product_id"]),
        "review": data["review"],
        "rating": int(data["rating"])
    }

    reviews.append(new_review)
    return jsonify(new_review), 201

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5002)