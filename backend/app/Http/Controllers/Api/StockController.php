<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\StockResource;
use App\Models\Stock;

class StockController extends Controller
{
    public function index()
    {
        $stocks = Stock::with('article')->latest()->paginate($this->perPage());

        return StockResource::collection($stocks);
    }
}
