<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StoreUpdateArticleRequest extends FormRequest
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
            'reference' => 'required|string|max:20|unique:articles,reference,'.$this->article?->id,
            'nom' => 'required|string|max:255',
            'prix' => 'required|numeric|min:0',
            'unite' => 'required|string|max:20',
            'categorie' => 'required|in:Volaille,Boeuf,Agneau,Charcuterie',
            'seuil_minimum' => 'required|integer|min:0',
        ];
    }
}
