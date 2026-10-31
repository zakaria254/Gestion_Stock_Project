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
Route::post('/login', [AuthenticatedSessionController::class, 'store']);

Route::middleware(['auth:sanctum', 'active'])->group(function () {
    Route::post('/logout', [AuthenticatedSessionController::class, 'destroy']);
    Route::get('/user', [AuthenticatedSessionController::class, 'show']);
});

// routes only admin can access 
Route::middleware(['auth:sanctum', 'active', 'can:admin_only'])->group(function () {
    Route::apiResource('users', UserController::class);
    Route::apiResource('suppliers', SupplierController::class);
    Route::apiResource('production_lots', ProductionLotController::class);   
    Route::get('/production_lots/completed/{production_lot}', [ProductionLotController::class, 'lot_completed']); 
    Route::get('/dashboard', [DashboardController::class, 'statistic']);  
});

// routes admin and ventes can access
Route::middleware(['auth:sanctum', 'active', 'can:ventes_admin_access'])->group(function () {
    Route::apiResource('clients', ClientController::class);
    Route::apiResource('sales', SaleController::class)->except(['show']);
    Route::get('/sales/validate/{sale}', [SaleController::class, 'validate_sale']);
    Route::get('/sales/annuler/{sale}', [SaleController::class, 'annuler_sale']);
    Route::get('/factures', [FactureController::class, 'index']);
    Route::get('/factures/{facture}/paid', [FactureController::class, 'facturePaid']);
    Route::get('/factures/{facture}/unpaid', [FactureController::class, 'factureUnpaid']);
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
