<?php

namespace App\Http\Requests;

use App\Models\Sale;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

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
            'numero' => 'required|string|min:5|max:20|unique:sales,numero,'.$this->sale?->id,
            'client_id' => 'required|exists:clients,id',
            'adresse_livraison' => 'nullable|string|max:255',
            // a sale can be validated right away on create; on update the status is ignored
            // (it only changes through the validate/cancel actions)
            'status' => $this->sale
                ? ['nullable']
                : ['nullable', Rule::in([Sale::STATUS_EN_ATTENTE, Sale::STATUS_VALIDEE])],
            'date_livraison' => 'nullable|date',
            'date_vente' => 'nullable|date',
            'articles' => 'required|array|min:1',
            'articles.*.id' => 'required|distinct|exists:articles,id',
            'articles.*.quantite' => 'required|numeric|gt:0',
            'articles.*.prix_unitaire' => 'required|numeric|gt:0',
        ];
    }
}
