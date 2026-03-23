<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProductionLot extends Model
{
    /** @use HasFactory<\Database\Factories\ProductionLotFactory> */
    use HasFactory;

    protected $fillable = [
        'numero_lot',
        'article_id',
        'quantite',
        'status',
        'date_production',
        'certificat_abattage'
    ];

    public function article () {
        return $this->belongsTo(Article::class);
    }
}
