<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Stock extends Model
{
    /** @use HasFactory<\Database\Factories\StockFactory> */
    use HasFactory;

    public const STATUS_DISPONIBLE = 'Disponible';

    public const STATUS_FAIBLE = 'Faible';

    public const STATUS_RUPTURE = 'Rupture';

    protected $fillable = [
        'article_id',
        'stock_actuel',
        'seuil_minimun',
        'status'
    ];

    public function article () {
        return $this->belongsTo(Article::class);
    }

    public function stock_movements () {
        return $this->hasMany(StockMovement::class);
    }
}
