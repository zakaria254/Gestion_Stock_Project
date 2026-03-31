<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StoreUpdateSaleRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'numero' => 'required|string|min:5|max:20|unique:sales,numero,' . $this->sale?->id,
            'client_id' => 'required|exists:clients,id',
            'article_id' => 'required|exists:articles,id',
            'quantite' => 'required|decimal:0,2|gt:0',
            'prix_unitaire' => 'required|decimal:0,2|gt:0',
            'montant_total' => 'required|decimal:0,2|gt:0',
            'status' => 'required|string|max:30',
            'date_vente' => 'required|date',
        ];
    }
}
