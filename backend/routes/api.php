<?php

use App\Http\Controllers\Api\ArticleController;
use App\Http\Controllers\Api\ClientController;
use App\Http\Controllers\Api\ProductionLotController;
use App\Http\Controllers\Api\StockController;
use App\Http\Controllers\Api\StockMovementController;
use App\Http\Controllers\Api\SupplierController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Auth\AuthenticatedSessionController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// Auth routes (no CSRF, works with Bearer Token in Postman)
Route::post('/login', [AuthenticatedSessionController::class, 'store']);
Route::post('/logout', [AuthenticatedSessionController::class, 'destroy'])->middleware('auth:sanctum');

Route::middleware(['auth:sanctum'])->get('/user', function (Request $request) {
    return $request->user();
});

// routes only admin can access 
Route::middleware(['auth:sanctum', 'can:admin_only'])->group(function () {
    Route::apiResource('users', UserController::class);
    Route::apiResource('suppliers', SupplierController::class);
    Route::apiResource('production_lots', ProductionLotController::class);   
});

// routes admin and ventes can access
Route::middleware(['auth:sanctum', 'can:ventes_admin_access'])->group(function () {
    Route::apiResource('clients', ClientController::class);
});

// routes admin and stock can access 
Route::middleware(['auth:sanctum', 'can:stock_admin_access'])->group(function () {
    Route::get('/stock', [StockController::class, 'index'])->name('stock');
    Route::apiResource('movements', StockMovementController::class);
});

// articles routes admin stock and ventes can access
Route::middleware(['auth:sanctum', 'can:manage_articles'])->group(function () {
   Route::apiResource('articles', ArticleController::class); 
});