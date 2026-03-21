<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StoreUpdateClientRequest extends FormRequest
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
            'nom' => 'required|string|max:99',
            'adresse' => 'required|string|max:255',
            'contact' => 'nullable|string|min:10|max:12|unique:clients,contact,'. $this->client?->id,
            'email' => 'nullable|email|unique:clients,email,'. $this->client?->id,
            'type' => 'nullable|in:boutique,entreprise,vente_local'
        ];
    }
}
