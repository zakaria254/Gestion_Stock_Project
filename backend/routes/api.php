<?php

use App\Http\Controllers\Api\ArticleController;
use App\Http\Controllers\Api\ClientController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\FactureController;
use App\Http\Controllers\Api\ProductionLotController;
use App\Http\Controllers\Api\SaleController;
use App\Http\Controllers\Api\StockController;
use App\Http\Controllers\Api\StockMovementController;
use App\Http\Controllers\Api\SupplierController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Auth\AuthenticatedSessionController;
use Illuminate\Support\Facades\Route;

// Auth routes (Bearer token)
Route::post('/login', [AuthenticatedSessionController::class, 'store'])->middleware('throttle:login');

Route::middleware(['auth:sanctum', 'active'])->group(function () {
    Route::post('/logout', [AuthenticatedSessionController::class, 'destroy']);
    Route::get('/user', [AuthenticatedSessionController::class, 'show']);
});

// routes only admin can access
Route::middleware(['auth:sanctum', 'active', 'can:admin_only'])->group(function () {
    Route::apiResource('users', UserController::class);
    Route::apiResource('suppliers', SupplierController::class);
    Route::apiResource('production_lots', ProductionLotController::class);
    Route::post('/production_lots/{production_lot}/complete', [ProductionLotController::class, 'complete']);
    Route::get('/dashboard', [DashboardController::class, 'statistic']);
});

// routes admin and ventes can access
Route::middleware(['auth:sanctum', 'active', 'can:ventes_admin_access'])->group(function () {
    Route::apiResource('clients', ClientController::class);
    Route::apiResource('sales', SaleController::class);
    Route::post('/sales/{sale}/validate', [SaleController::class, 'validateSale']);
    Route::post('/sales/{sale}/cancel', [SaleController::class, 'cancel']);
    Route::apiResource('factures', FactureController::class)->only(['index', 'show']);
    Route::post('/factures/{facture}/paid', [FactureController::class, 'markPaid']);
    Route::post('/factures/{facture}/unpaid', [FactureController::class, 'markUnpaid']);
});

// routes admin and stock can access
Route::middleware(['auth:sanctum', 'active', 'can:stock_admin_access'])->group(function () {
    Route::get('/stock', [StockController::class, 'index'])->name('stock');
    Route::apiResource('movements', StockMovementController::class);
});

// articles routes admin stock and ventes can access
Route::middleware(['auth:sanctum', 'active', 'can:manage_articles'])->group(function () {
    Route::apiResource('articles', ArticleController::class);
});
