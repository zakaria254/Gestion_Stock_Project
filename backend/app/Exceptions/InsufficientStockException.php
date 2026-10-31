<?php

namespace App\Exceptions;

use App\Models\Stock;
use Illuminate\Http\JsonResponse;
use RuntimeException;

class InsufficientStockException extends RuntimeException
{
    public function __construct(public readonly Stock $stock, public readonly float $requested)
    {
        $name = $stock->article?->nom ?? "#{$stock->article_id}";

        parent::__construct("Insufficient stock for article {$name}. Available: {$stock->stock_actuel}, requested: {$requested}");
    }

    public function render(): JsonResponse
    {
        return response()->json([
            'message' => $this->getMessage(),
            'errors' => ['quantite' => [$this->getMessage()]],
        ], 422);
    }
}
