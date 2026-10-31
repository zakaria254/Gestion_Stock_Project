<?php

namespace App\Models;

use Database\Factories\ProductionLotFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProductionLot extends Model
{
    /** @use HasFactory<ProductionLotFactory> */
    use HasFactory;

    public const STATUS_AVAILABLE = 'AVAILABLE';

    public const STATUS_IN_PROGRESS = 'IN_PROGRESS';

    public const STATUS_COMPLETED = 'COMPLETED';

    protected $fillable = [
        'numero_lot',
        'article_id',
        'quantite',
        'status',
        'date_production',
        'certificat_abattage',
    ];

    public function article()
    {
        return $this->belongsTo(Article::class);
    }
}
