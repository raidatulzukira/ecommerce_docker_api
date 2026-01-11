<?php

require_once __DIR__.'/../vendor/autoload.php';

(new Laravel\Lumen\Bootstrap\LoadEnvironmentVariables(
    dirname(__DIR__)
))->bootstrap();

date_default_timezone_set(env('APP_TIMEZONE', 'UTC'));

$app = new Laravel\Lumen\Application(
    dirname(__DIR__)
);

// Enable Facades (Supaya bisa panggil Redis::get)
$app->withFacades();

// Enable Eloquent (Opsional kalau mau pakai DB biasa, tapi untuk Redis ini aman dimatikan/dinyalakan)
// $app->withEloquent();

// Load Config
$app->configure('database');

// Register Redis Service Provider
$app->register(Illuminate\Redis\RedisServiceProvider::class);

// Load Routes
$app->router->group([
    'namespace' => 'App\Http\Controllers',
], function ($router) {
    require __DIR__.'/../routes/web.php';
});

return $app;