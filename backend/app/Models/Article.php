<?php

namespace App\Models;

use Database\Factories\ArticleFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Article extends Model
{
    /** @use HasFactory<ArticleFactory> */
    use HasFactory;

    protected $fillable = [
        'reference',
        'nom',
        'prix',
        'unite',
        'categorie',
        'seuil_minimum',
    ];

    public function production_lots()
    {
        return $this->hasMany(ProductionLot::class);
    }

    public function stock()
    {
        return $this->hasOne(Stock::class);
    }

    public function sales()
    {
        return $this->belongsToMany(Sale::class, 'sale_article')
            ->withPivot(['quantite', 'prix_unitaire', 'total'])
            ->withTimestamps();
    }
}
