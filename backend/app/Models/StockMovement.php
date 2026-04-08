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
        'motif',
        'is_generated'
    ];

    protected $casts = [
        'is_generated' => 'boolean',
    ];

    public function stock () {
        return $this->belongsTo(Stock::class);
    }
}
