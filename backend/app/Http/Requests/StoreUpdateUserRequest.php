<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StoreUpdateUserRequest extends FormRequest
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
            'prenom' => 'required|string|max:99',
            'email' => 'required|email|max:255|unique:users,email,'. $this->user?->id, //checks if the email is unique in the users table except the current user
            'access_code' => 'required|max:6|min:6|unique:users,access_code,'. $this->user?->id, //checks if the access code is unique in the users table except the current user
            'role' => 'required|in:admin,ventes,stock',
            'status' => 'nullable|in:active,inactive',
        ];
    }
}
