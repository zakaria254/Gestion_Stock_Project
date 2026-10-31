<?php

use App\Models\Stock;
use App\Observers\StockObserver;

function statusFor(float $quantite, float $seuil): string
{
    $stock = new Stock(['stock_actuel' => $quantite, 'seuil_minimun' => $seuil]);
    (new StockObserver)->saving($stock);

    return $stock->status;
}

test('stock status follows quantity and threshold', function (float $quantite, float $seuil, string $expected) {
    expect(statusFor($quantite, $seuil))->toBe($expected);
})->with([
    'empty' => [0, 10, Stock::STATUS_RUPTURE],
    'at threshold' => [10, 10, Stock::STATUS_FAIBLE],
    'below threshold' => [3, 10, Stock::STATUS_FAIBLE],
    'above threshold' => [11, 10, Stock::STATUS_DISPONIBLE],
    'no threshold' => [1, 0, Stock::STATUS_DISPONIBLE],
]);
