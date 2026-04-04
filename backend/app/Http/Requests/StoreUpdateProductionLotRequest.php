<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StoreUpdateProductionLotRequest extends FormRequest
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
            'numero_lot' => 'required|string|min:10|max:20|unique:production_lots,numero_lot,' . $this->production_lot?->id,
            'quantite' => 'required|decimal:0,2|gt:0',
            'article_id' => 'required|exists:articles,id',
            'status' => 'required|string|in:AVAILABLE,IN_PROGRESS,COMPLETED',
            'date_production' => 'nullable|date',
            'certificat_abattage' => 'nullable|string'
        ];
    }
}
