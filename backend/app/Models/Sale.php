<?php

namespace App\Models;

use Database\Factories\SaleFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Sale extends Model
{
    /** @use HasFactory<SaleFactory> */
    use HasFactory;

    public const STATUS_EN_ATTENTE = 'En attente';

    public const STATUS_VALIDEE = 'Validee';

    public const STATUS_ANNULEE = 'Annulee';

    protected $fillable = [
        'numero',
        'client_id',
        'user_id',
        'montant_total',
        'adresse_livraison',
        'date_livraison',
        'status',
        'date_vente',
    ];

    protected $casts = [
        'montant_total' => 'decimal:2',
        'date_vente' => 'datetime',
        'date_livraison' => 'datetime',
    ];

    public function client()
    {
        return $this->belongsTo(Client::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function articles()
    {
        return $this->belongsToMany(Article::class, 'sale_article')
            ->withPivot(['quantite', 'prix_unitaire', 'total'])
            ->withTimestamps();
    }

    public function facture()
    {
        return $this->hasOne(Facture::class);
    }
}
