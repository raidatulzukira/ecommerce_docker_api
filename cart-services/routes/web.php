<?php

/** @var \Laravel\Lumen\Routing\Router $router */

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Redis;

$router->get('/', function () {
    return 'Cart Service RUNNING. Redis Connection: OK';
});

// ---------------------------------------------------------
// 1. TAMBAH KE KERANJANG (POST)
// ---------------------------------------------------------
$router->post('/cart', function (Request $request) {
    // Validasi input
    $this->validate($request, [
        'user_id' => 'required',
        'product_id' => 'required',
        'name' => 'required',
        'price' => 'required'
    ]);

    $userId = $request->input('user_id');
    $productId = $request->input('product_id');

    // Format data yang akan disimpan
    $item = [
        'product_id' => $productId,
        'name' => $request->input('name'),
        'price' => $request->input('price'),
        'quantity' => $request->input('quantity', 1)
    ];

    // Simpan ke Redis menggunakan HASH
    // Key utama: cart:{userId}
    // Sub-Key (Field): {productId}
    // Value: JSON Data
    app('redis')->hset("cart:$userId", $productId, json_encode($item));

    return response()->json(['message' => 'Item added to cart'], 201);
});

// ---------------------------------------------------------
// 2. AMBIL LIST KERANJANG (GET)
// ---------------------------------------------------------
$router->get('/cart/{userId}', function ($userId) {
    // Ambil semua item dari Key cart:{userId}
    $cartData = app('redis')->hgetall("cart:$userId");
    
    $result = [];
    foreach ($cartData as $key => $json) {
        // Decode JSON string kembali menjadi Object/Array
        $result[] = json_decode($json, true);
    }
    
    // Return sebagai List JSON agar Flutter bisa membacanya
    return response()->json($result);
});

// ---------------------------------------------------------
// 3. UPDATE QUANTITY (PUT)
// ---------------------------------------------------------
$router->put('/cart/{userId}/{productId}', function (Request $request, $userId, $productId) {
    $redis = app('redis');
    
    // Cek apakah item ada
    $json = $redis->hget("cart:$userId", $productId);
    
    if (!$json) {
        return response()->json(['message' => 'Item not found'], 404);
    }
    
    // Update datanya
    $item = json_decode($json, true);
    $item['quantity'] = $request->input('quantity');
    
    // Simpan kembali (menimpa yang lama)
    $redis->hset("cart:$userId", $productId, json_encode($item));
    
    return response()->json(['message' => 'Quantity updated']);
});

// ---------------------------------------------------------
// 4. HAPUS ITEM (DELETE)
// ---------------------------------------------------------
$router->delete('/cart/{userId}/{productId}', function ($userId, $productId) {
    // Hapus field productId dari key cart:userId
    app('redis')->hdel("cart:$userId", $productId);
    
    return response()->json(['message' => 'Item deleted']);
});