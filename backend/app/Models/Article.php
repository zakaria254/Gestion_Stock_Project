<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Article extends Model
{
    /** @use HasFactory<\Database\Factories\ArticleFactory> */
    use HasFactory;

    protected $fillable = [
        'reference',
        'nom',
        'prix',
        'unite',
        'categorie',
        'seuil_minimum',
    ];

    public function production_lots () {
        return $this->hasMany(ProductionLot::class);
    }

    public function stock () {
        return $this->hasOne(Stock::class);
    }
}
