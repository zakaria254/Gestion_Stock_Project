<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class StockMovement extends Model
{
    /** @use HasFactory<\Database\Factories\StockMovementFactory> */
    use HasFactory;

    protected $fillable = [
        'stock_id',
        'type',
        'quantite',
        'motif'
    ];

    public function stock () {
        return $this->belongsTo(Stock::class);
    }
}
