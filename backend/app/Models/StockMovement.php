<?php

namespace App\Models;

use Database\Factories\StockMovementFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class StockMovement extends Model
{
    /** @use HasFactory<StockMovementFactory> */
    use HasFactory;

    public const TYPE_IN = 'in';

    public const TYPE_OUT = 'out';

    protected $fillable = [
        'stock_id',
        'type',
        'quantite',
        'motif',
        'is_generated',
    ];

    protected $casts = [
        'is_generated' => 'boolean',
    ];

    public function stock()
    {
        return $this->belongsTo(Stock::class);
    }
}
