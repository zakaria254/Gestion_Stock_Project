<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Facture extends Model
{
    protected $fillable = [
        'numero',
        'sale_id',
        'status',
        'montant_total',
        'date_payment'
    ];

    protected $casts = [
        'montant_total' => 'decimal:2',
        'date_payment' => 'datetime'
    ];
    
    public function sale()
    {
        return $this->belongsTo(Sale::class);
    }
}
